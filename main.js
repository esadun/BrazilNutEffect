//Box2D convenience
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;


var world;
var vessel;
var runInterval;
var statsInterval;
var updates;
var brazilNuts;
var brazilNutAvgHeights = [];
var normalNuts;
var normalNutAvgHeights = [];
var initialTime = new Date().getTime();
var isRunning = false;
var framerate = 60;
var statsRate = 1;
var nutSize = .3;
var brazilSize;
var chart;

function main() {

  console.log("top of main");
  createChart();
  boxdrop();
}

function boxdrop() {
  console.log("top of boxdrop");
  updates = 0;
  brazilNuts = [];
  normalNuts = [];

  world = new b2World(
    new b2Vec2(0, 10)
    , true
  );

  // body and fixture
  var bodyDef = new b2BodyDef;
  var fixDef = new b2FixtureDef;


  var numNuts = parseFloat(document.getElementById("numNuts").value);
  var numBrazil = parseFloat(document.getElementById("percentBrazils").value) / 100 * numNuts;
  var numOther = numNuts - numBrazil;
  brazilSize = parseFloat(document.getElementById("brazilRelativeSize").value) * nutSize;

  for (var i = 0; i < numOther; i++) {
    normalNuts.push(createBall(bodyDef, fixDef, Math.floor(5 + Math.random() * 10), Math.floor(Math.random() * 3) + 4, nutSize));
  }
  for (var i = 0; i < numBrazil; i++) {
    brazilNuts.push(createBall(bodyDef, fixDef, 5 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 3) + 4, brazilSize));
  }

  vessel = createVessel(bodyDef, fixDef);

  setupDebugDraw();
  runInterval = window.setInterval(update, 1000 / framerate);
  isRunning = true;
}

function reset() {
  clearInterval(runInterval);
  clearInterval(statsInterval);
  createChart();
  //clearInterval(statsInterval);
  boxdrop();
}

function pause() {
  if (isRunning) {
    clearInterval(runInterval);
    clearInterval(statsInterval);
    isRunning = false;
  } else {
    runInterval = window.setInterval(update, 1000 / framerate);
    statsInterval = window.setInterval(function () {
      renderStats(chart);
    }, 1000 / statsRate);
    isRunning = true;
  }

};

function updateControlInfo(control) {
  control.parentElement.querySelector(".info").innerHTML = parseFloat(control.value);
};

function createVessel(bodyDef, fixDef) {
  bodyDef.type = b2Body.b2_kinematicBody;//.b2_staticBody;

  fixDef.shape = new b2PolygonShape;
  bodyDef.position.x = 0;
  bodyDef.position.y = 0;

  var vessel = world.CreateBody(bodyDef);

  //Top
  fixDef.shape.SetAsEdge(new b2Vec2(0, -10), new b2Vec2(20, -10))
  vessel.CreateFixture(fixDef);

  //Bottom
  fixDef.shape.SetAsEdge(new b2Vec2(0, 10), new b2Vec2(20, 10))
  vessel.CreateFixture(fixDef);

  //Sides
  fixDef.shape.SetAsEdge(new b2Vec2(1, -10), new b2Vec2(1, 10))
  vessel.CreateFixture(fixDef);
  fixDef.shape.SetAsEdge(new b2Vec2(19, -10), new b2Vec2(19, 10))
  vessel.CreateFixture(fixDef);

  //Vee
  fixDef.shape.SetAsEdge(new b2Vec2(0, 15), new b2Vec2(5, 10))
  vessel.CreateFixture(fixDef);
  fixDef.shape.SetAsEdge(new b2Vec2(20, 15), new b2Vec2(15, 10))
  vessel.CreateFixture(fixDef);

  return vessel;
};

function vibrateVessel(vessel, velocity) {
  vessel.SetLinearVelocity(new b2Vec2(velocity / 5, velocity));
}

function createBall(bodyDef, fixDef, originX, originY, radius, density) {
  // Create a Ball (body, fixture, shape)
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = originX;
  bodyDef.position.y = originY;
  if (density != undefined) {
    fixDef.density = density;
  } else {
    fixDef.density = 1.0;
  }
  fixDef.friction = 0.5
  fixDef.restitution = 0.5;
  fixDef.shape = new b2CircleShape(radius);
  var body = world.CreateBody(bodyDef);
  body.CreateFixture(fixDef);
  body.SetLinearVelocity(new b2Vec2(0, -4)); // give the ball velocity
  //world.CreateBody(bodyDef).CreateFixture(fixDef);
  return body;
};

function update() {
  updates++;
  world.Step(1 / framerate, 10, 10);
  world.DrawDebugData();
  world.ClearForces();
  var amp = parseFloat(document.getElementById("amplitude").value);
  var freq = parseFloat(document.getElementById("frequency").value);
  var vesselVel = amp * Math.sin((2 * 3.14 / freq) * updates);
  vibrateVessel(vessel, vesselVel);
};

function renderStats(theChart) {
  var totalBrazilHeights = 0;
  for (var i = 0; i < brazilNuts.length; i++) {
    totalBrazilHeights += (brazilNuts[i].GetPosition().y + brazilSize);
  }
  var totalNormalHeights = 0;
  for (var i = 0; i < normalNuts.length; i++) {
    totalNormalHeights += (normalNuts[i].GetPosition().y + nutSize);
  }
  var timeEllapsed = (new Date().getTime()) - initialTime;
  brazilNutAvgHeights.push({ x: timeEllapsed / 1000, y: 10 - (totalBrazilHeights / brazilNuts.length) });
  normalNutAvgHeights.push({ x: timeEllapsed / 1000, y: 10 - (totalNormalHeights / normalNuts.length) });
  theChart.render();
};

function createChart() {
  brazilNutAvgHeights = [];
  normalNutAvgHeights = [];
  chart = new CanvasJS.Chart("avgHeights", {
    title: {
      text: "Average Brazil Height"
    },
    axisX: {
      title: "Time (s)"
    },
    axisY: {
      title: "Height from bottom (m)",
      maximum: 6,
      minimum: 0
    },
    data: [{
      type: "line",
      dataPoints: brazilNutAvgHeights,
      showInLegend: true,
      legendText: "Brazils",
    }, {
      type: "line",
      dataPoints: normalNutAvgHeights,
      showInLegend: true,
      legendText: "Others",
    }]
  });
  setTimeout(function () {
    statsInterval = setInterval(function () {
      renderStats(chart);
    }, 1000 / statsRate)
  }, 2500);
};


function setupDebugDraw() {
  var debugDraw = new b2DebugDraw();
  debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
  debugDraw.SetDrawScale(30.0);
  debugDraw.SetFillAlpha(0.3);
  debugDraw.SetLineThickness(2.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);
};