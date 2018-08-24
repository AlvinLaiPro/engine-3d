(() => {
  const { cc, app } = window;
  const { vec3, color4 } = cc.math;

  let camEnt = app.createEntity('camera');
  camEnt.setLocalPos(10, 10, 10);
  camEnt.lookAt(vec3.create(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Widget');
  screen.addComp('Screen');

  // button1 (simple)
  {
    let ent = app.createEntity('button');
    ent.setParent(screen);
    let widget = ent.addComp('Widget');
    widget.setOffset(0, 50);
    widget.setAnchors(0.5, 0.5, 0.5, 0.5);
    widget.setSize(160, 30);
    ent.addComp('Image');
    let button = ent.addComp('Button');
    button.background = ent;
    button.transition = 'color';
    button.transitionColors.normal = color4.create(0.8, 0.8, 0.8, 1);
    button.transitionColors.highlight = color4.create(1, 1, 0, 1);
    button.transitionColors.pressed = color4.create(0.5, 0.5, 0.5, 1);
    button.transitionColors.disabled = color4.create(0.2, 0.2, 0.2, 1);
    button._updateState();
  }

  // button2 (with text)
  {
    let ent = app.createEntity('button-02');
    ent.setParent(screen);
    let widget = ent.addComp('Widget');
    widget.setOffset(0, -50);
    widget.setAnchors(0.5, 0.5, 0.5, 0.5);
    widget.setSize(160, 30);
    ent.addComp('Image');
    let button = ent.addComp('Button');

    let entLabel = app.createEntity('label');
    entLabel.setParent(ent);
    let widgetComp = entLabel.addComp('Widget');
    widgetComp.setAnchors(0, 0, 1, 1);
    widgetComp.setSize(0, 0);
    let text = entLabel.addComp('Text');
    text.text = 'Foobar';
    text.color = color4.create(0, 0, 0, 1);
    text.align = 'middle-center';

    button.background = ent;
    button.transition = 'color';
    button.transitionColors.normal = color4.create(1, 1, 1, 1);
    button.transitionColors.highlight = color4.create(1, 1, 0, 1);
    button.transitionColors.pressed = color4.create(0.5, 0.5, 0.5, 1);
    button.transitionColors.disabled = color4.create(0.2, 0.2, 0.2, 1);
    button._updateState();

    ent.on('transition', e => {
      // let state = e.component._state;
      let state = e.detail.newState;

      if (state === 'normal') {
        text.color = color4.create(0, 0, 0, 1);
      } else if (state === 'highlight') {
        text.color = color4.create(1, 0, 0, 1);
      } else if (state === 'pressed') {
        text.color = color4.create(0.2, 0.2, 0.2, 1);
      }
    });
  }

})();