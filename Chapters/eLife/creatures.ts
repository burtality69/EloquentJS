///<reference path="environment.ts"/>
interface Creaturespec{ 
  energy: number; 
  direction: string; 
  act(v:View):Action; 
  preySeen?: Array<any>; 
  originChar?: string
};

var Creaturespecs: {[id: string]: Creaturespec } = {}

class creature { 
  public act: Function;
  public energy: number;
  public direction: string;
  public preySeen: Array<any>
  public originChar: string;
   
  constructor(public spec: Creaturespec, originChar: string) {
    this.act = spec.act;
    this.energy = spec.energy;
    this.direction = spec.direction;
    this.originChar = originChar;
    this.preySeen = spec.preySeen;
  }
};

function createCreature(legend:Object, ch: string): creature {
  if (ch == " ")
    return null;
  var s: Creaturespec = Creaturespecs[legend[ch]];
  var c: creature = new creature(s,ch)
  return c;
}

Creaturespecs["Wall"] = {
  energy: null,
  direction: null,
  act: null  
};

Creaturespecs["PlantEater"] = {
  energy:20, 
  direction: "" , 
  act: function(view: View) {
    var space = view.find(" ");
    if (this.energy > 60 && space)
      return <Action>{type: "reproduce", direction: space};
    var plant = view.find("*");
    if (plant)
      return <Action>{type: "eat", direction: plant};
    if (space)
      return <Action>{type: "move", direction: space};
  }
};

Creaturespecs["WallFollower"] = {
    energy: 20 , 
    direction: "s" , 
    act: function(view: View):Action {
      var start = this.direction;
      if (view.look(utilities.dirPlus(this.direction, -3)) != null)
        start = this.direction = utilities.dirPlus(this.direction, -2);
      while (view.look(this.direction) != null) {
        this.direction = utilities.dirPlus(this.direction, 1);
        if (this.direction == start) break;
      }
      return <Action>{type: "move", direction: this.direction};
    }
};


Creaturespecs["BouncingCritter"] = {
  energy: 20, 
  direction: utilities.randomElement(directionNames),
  act: function(view: View):Action {
    if (view.look(this.direction) != null)
      this.direction = view.find(" ") || "s";
      return <Action>{type: "move", direction: this.direction};
    }
}


Creaturespecs["Plant"] = {
    energy: 3 + Math.random() * 4,
    direction: '',
    act: function(view: View):Action {
      if (this.energy > 15) {
        var space = view.find(" ");
        if (space)
          return <Action>{type: "reproduce", direction: space};
      }
      if (this.energy < 20)
        return <Action>{type: "grow", direction: null};
    }
}

Creaturespecs["SmartPlantEater"] = {
    energy:30,
    direction:"e",
    act: function(view: View):Action {
      var space = view.find(" "); //Never find space???... 
      if (this.energy > 90 && space)
        return {type: "reproduce", direction: space};
      var plants = view.findAll("*");
      if (plants.length > 1)
        return {type: "eat", direction: utilities.randomElement(plants)};
      if (view.look(this.direction) != null && space)
        this.direction = space;
        return {type: "move", direction: this.direction};
    }
}

Creaturespecs["Tiger"] = {
    energy:100 , 
    direction:"w" , 
    preySeen: new Array(0),
    act:function(view: View):Action {
      // Average number of prey seen per turn
      var seenPerTurn: number = this.preySeen.reduce(function(a, b) {
        return a + b;
      }, 0) / this.preySeen.length;
      var prey: Array<creature> = view.findAll("O");
      this.preySeen.push(prey.length);
      
      if (this.preySeen.length > 6) // Drop the first element from the array when it is longer than 6
        this.preySeen.shift();
    
      if (prey.length && seenPerTurn > 0.25) // Only eat if the predator saw more than ¼ prey animal per turn
        return {type: "eat", direction: utilities.randomElement(prey)};
        
      var space = view.find(" ");
      if (this.energy > 400 && space)
        return {type: "reproduce", direction: space};
      if (view.look(this.direction) != null && space)
        this.direction = space;
        return {type: "move", direction: this.direction};
    },
}