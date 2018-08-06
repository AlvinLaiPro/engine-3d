import { Component } from '../../ecs';

export default class ColliderComponent extends Component {
  constructor() {
    super();
  }
  
  onInit() {
    // engine specific init happens here
    this._system.add(this);
    
    /**
     * **@schema** The collider type, only boxes and spheres are supported
     * @type {number}
     */
    this.type = this._type;
    /**
     * **@schema** Is the collider a trigger?
     * @type {boolean}
     */
    this.isTrigger = this._isTrigger;
    /**
     * **@schema** The material used by the collider
     * @type {PhysicsMaterial}
     */
    this.material = this._material;
    /**
     * **@schema** center of the collider
     * @type {vec3}
     */
    this.center = this._center;
    /**
     * **@schema** size of the box collider
     * @type {vec3}
     */
    this.size = this._size;
    /**
     * **@schema** radius of the sphere collider
     * @type {number}
     */
    this.radius = this._radius;
    /**
     * **@schema** The rigidbody mass, 0 for static objects
     * @type {number}
     */
    this.mass = this._mass;
    /**
     * **@schema** The drag of the object
     * @type {number}
     */
    this.drag = this._drag;
    /**
     * **@schema** The angular drag of the object
     * @type {number}
     */
    this.angularDrag = this._angularDrag;
    /**
     * **@schema** Controlls whether physics affects the rigidbody.
     * @type {boolean}
     */
    this.useGravity = this._useGravity;
    /**
     * **@schema** Controlls whether physics affects the rigidbody.
     * @type {boolean}
     */
    this.isKinematic = this._isKinematic;
    /**
     * **@schema** Controls whether physics will change the rotation of the object
     * @type {boolean}
     */
    this.freezeRotation = this._freezeRotation;
  }

  onDestroy() {
    this._system.remove(this);
  }
}

ColliderComponent.schema = {
  // collider shape info
  type: {
    type: 'string',
    default: 'box'
  },
  isTrigger: {
    type: 'boolean',
    default: false,
    set(val) {
      this._isTrigger = val;
      this.body.setIsTrigger(val);
    }
  },
  material: {
    type: 'asset',
    default: null,
    set(val) {
      this._material = val;
      this.body.setMaterial(val);
    }
  },
  center: {
    type: 'vec3',
    default: [0, 0, 0],
    set(val) {
      this._center = val;
      this.body.setCenter(val);
    }
  },
  size: {
    type: 'vec3',
    default: [2, 2, 2],
    set(val) {
      this._size = val;
      this.body.setSize(val);
    }
  },
  radius: {
    type: 'number',
    default: 1,
    set(val) {
      this._radius = val;
      this.body.setRadius(val);
    }
  },
  // rigidbody
  mass: {
    type: 'number',
    default: 0,
    set(val) {
      this._mass = val;
      this.body.setMass(val);
    }
  },
  drag: {
    type: 'number',
    default: 0,
    set(val) {
      this._drag = val;
      this.body.setDrag(val);
    }
  },
  angularDrag: {
    type: 'number',
    default: 0.05,
    set(val) {
      this._drag = val;
      this.body.setAngularDrag(val);
    }
  },
  useGravity: {
    type: 'boolean',
    default: true,
    set(val) {
      this._useGravity = val;
      this.body.setUseGravity(val);
    }
  },
  isKinematic: {
    type: 'boolean',
    default: false,
    set(val) {
      this._isKinematic = val;
      this.body.setIsKinematic(val);
    }
  },
  freezeRotation: {
    type: 'boolean',
    default: false,
    set(val) {
      this._freezeRotation = val;
      this.body.setFreezeRotation(val);
    }
  }
};
