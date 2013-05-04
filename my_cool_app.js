/**
 * Easter weekend tic-tac-toe program, demo uploaded at http://tictac.meteor.com/
 */
Players = new Meteor.Collection("players");
BoardMatrix = new Meteor.Collection("board");

Meteor.methods({
  resetBoard: function() {
    BoardMatrix.remove({});
    var data = [
      {"_id": "board-0", "value": " "},
      {"_id": "board-1", "value": " "},
      {"_id": "board-2", "value": " "},
      {"_id": "board-3", "value": " "},
      {"_id": "board-4", "value": " "},
      {"_id": "board-5", "value": " "},
      {"_id": "board-6", "value": " "},
      {"_id": "board-7", "value": " "},
      {"_id": "board-8", "value": " "}
    ];
    data.forEach(function(row) {
      BoardMatrix.insert(row);
    });
  },

  resetPlayers: function() {
    Players.remove({});
    var data = [{"id": 1, "name": "Aman Tuladhar", "score": 0, "selected": true, "symbol": "X", "winner": false},
                {"id": 2, "name": "Priti Rai", "score": 0, "selected": false, "symbol": "O", "winner": false}];
    data.forEach(function(player) {
      Players.insert(player);
    });
  }
});

if (Meteor.isClient) {
  // TODO make this more efficient
  var isGameOver = function () {
    var rows = BoardMatrix.find({}).fetch();
    var isOver = false;

    ['X', 'O'].forEach(function(symbol){
      // col
      [0, 3, 6].forEach(function(val){
        if (rows[val].value === symbol && rows[val+1].value === symbol && rows[val+2].value === symbol) {
          isOver = true;
        }
      });

      // row
      [0, 1, 2].forEach(function(val){
        if (rows[val].value === symbol && rows[val + 3].value === symbol && rows[val + 6].value === symbol) {
          isOver = true;
        }
      });

      // diagonals
      if (rows[0].value === symbol && rows[4].value === symbol && rows[8].value === symbol) {
        isOver = true;
      }

      if (rows[2].value === symbol && rows[2+2].value === symbol && rows[2+4].value === symbol) {
        isOver = true;
      }
    });

    return isOver;
  };

  Template.players.lists = function() {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.players.events({
    'click #btnReset' : function () {
      Meteor.call("resetPlayers");
      Meteor.call("resetBoard");
      Session.set("winner", false);
    }
  });

  Template.board.boardMatrix = function() {
    return BoardMatrix.find({});
  };

  Template.board.winner = function() {
    var player = Players.findOne({winner: true});
    return player && player.name;
  };

  Template.player.events({
    'click div.playerName': function(e) {
      e.toElement.style.display = 'none';
      var input = document.getElementById(this._id);
      input.style.display = 'block';
      input.focus();
    },

    'change input': function(e) {
      var value = e.srcElement.value;
      if (value.trim() != "") {
        Players.update({_id: this._id}, {$set: {name: value}});
      } else {
        var el = document.getElementById('alias-' + this._id);
        el.style.display = 'block';
        e.srcElement.style.display = 'none';
        e.srcElement.value = el.innerText;
      }
    }
  });

  Template.board.events({
    'click' : function (e) {
      var selected_player = Players.find({selected: true}).fetch()[0];

      var result = Players.find({_id: {$not: selected_player._id}});
      result.forEach(function(row) {
        Players.update({_id: row._id}, {$set: {selected: true}});
      });

      Players.update({_id: selected_player._id}, {$set: {selected: false}});

      BoardMatrix.update({_id: this._id}, {$set:{'value': selected_player.symbol}});

      if (isGameOver()) {
        Players.update({_id: selected_player._id}, {$set: {winner: true}});
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.call("resetPlayers");
    Meteor.call("resetBoard");
  });
}
