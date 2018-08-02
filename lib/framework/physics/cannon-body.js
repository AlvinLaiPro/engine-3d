import { vec3, quat } from '../../vmath';
import { enums } from '../../geom-utils';
import CANNON from 'cannon';

let v3_tmp = vec3.zero();
let qt_tmp = quat.create();

function maxComponent(v) { return Math.max(Math.max(v.x, v.y), v.z); }

export default class CannonBody extends CANNON.Body {
  constructor(options) {
    super(options);
    // save references
    this._entity = options._entity;
    this._system = options._system;
    this._world = options._system.world;
    this._size = vec3.new(1, 1, 1);
    this._radius = 1;
    // create shape
    this.shapeType = options.type;
    this.shape = this.createShape(options);
    this.addShape(this.shape, new CANNON.Vec3().copy(options.center));
    // dispatch collision events to entity
    this.addEventListener('collide', (event) => {
      // TODO: uniform event interface across engines
      this._entity.emit('collide', event);
    });
    this.updateIn = this.updateIn.bind(this);
    this.updateOut = this.updateOut.bind(this);
    this.updateIn(); // TODO: emit event after transform change perhaps?
  }
  
  createShape(options) {
    this._entity.getWorldScale(v3_tmp);
    switch (options.type) {
      case enums.SHAPE_BOX:
        vec3.scale(v3_tmp, vec3.mul(v3_tmp, v3_tmp, options.size), 0.5);
        return new CANNON.Box(new CANNON.Vec3(v3_tmp.x, v3_tmp.y, v3_tmp.z));
      case enums.SHAPE_SPHERE:
        return new CANNON.Sphere(options.radius * maxComponent(v3_tmp));
      default:
        console.warn('Unsupported collider type - only boxes and spheres are supported');
        // default to a unit half extents box
        return new CANNON.Box(new CANNON.Vec3(v3_tmp.x, v3_tmp.y, v3_tmp.z));
    }
  }

  setCollisionFilter(group, mask) {
    this.collisionFilterGroup = group;
    this.collisionFilterMask  = mask;
  }

  /**
   * Set the mass of the object
   * @param {number} val the new mass
   */
  setMass(val) {
    this.mass = val;
    this.updateMassProperties();
    this._validateTypeAndMode();
  }

  /**
   * Set the drag of the object
   * @param {number} val [0, 1] the drag
   */
  setDrag(val) {
    this.linearDamping = val;
  }

  /**
   * Set the angular drag of the object
   * @param {number} val [0, 1] the angular drag
   */
  setAngularDrag(val) {
    this.angularDamping = val;
  }
  
  setIsKinematic(val) {
    this._isKinematic = val;
    this._validateTypeAndMode();
  }

  setFreezeRotation(val) {
    this.fixedRotation = val;
    this.updateMassProperties();
  }

  setIsTrigger(val) {
    if (val) {
      this.setCollisionFilter(1 << 31, 1 << 31);
      this.setUpdateMode(true, false);
    } else {
      this.setCollisionFilter(1, 1);
      this._validateTypeAndMode();
    }
  }

  setCenter(val) {
    this.shapeOffsets[0].set(val.x, val.y, val.z);
    this.updateBoundingRadius();
  }

  setSize(val) {
    if (this.shapeType != enums.SHAPE_BOX) return;
    if (!val) val = this._size;
    this._entity.getWorldScale(v3_tmp);
    vec3.scale(v3_tmp, vec3.mul(v3_tmp, v3_tmp, val), 0.5);
    this.shape.halfExtents.set(v3_tmp.x, v3_tmp.y, v3_tmp.z);
    this.shape.updateConvexPolyhedronRepresentation();
    this.shape.updateBoundingSphereRadius();
    this.updateBoundingRadius();
    this._size = val;
  }

  setRadius(val) {
    if (this.shapeType != enums.SHAPE_SPHERE) return;
    if (!val) val = this._radius;
    this._entity.getWorldScale(v3_tmp);
    this.shape.radius = val * maxComponent(v3_tmp);
    this.shape.updateBoundingSphereRadius();
    this.updateBoundingRadius();
    this._radius = val;
  }

  setUpdateMode(In, Out) {
    if (In) this._world.addEventListener('preStep', this.updateIn);
    else this._world.removeEventListener('preStep', this.updateIn);
    if (Out) this._world.addEventListener('postStep', this.updateOut);
    else this._world.removeEventListener('postStep', this.updateOut);
  }

  _validateTypeAndMode() {
    if (this._isKinematic) this.type = CANNON.Body.KINEMATIC;
    else this.type = (this.mass <= 0 ?
      CANNON.Body.STATIC : CANNON.Body.DYNAMIC);
    if (this.type !== CANNON.Body.STATIC) {
      this.setUpdateMode(false, true);
      this._system._fullSimulation = true;
    }
  }

  manualUpdate(fixedRotation) {
    this.updateIn(null, fixedRotation);
    this.setSize(); this.setRadius();
  }

  updateIn(event, fixedRotation = this.fixedRotation) {
    this._entity._getWorldPosAndRot(v3_tmp, qt_tmp);
    this.position.set(v3_tmp.x, v3_tmp.y, v3_tmp.z);
    if (!fixedRotation)
      this.quaternion.set(qt_tmp.x, qt_tmp.y, qt_tmp.z, qt_tmp.w);
  }

  updateOut(event, fixedRotation = this.fixedRotation) {
    this._entity.setWorldPos(this.position);
    if (!fixedRotation)
      this._entity.setWorldRot(this.quaternion);
  }
}
