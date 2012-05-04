var Groubook = function(){

  this.friends = [];
  FB.getLoginStatus(function(login){
   if(login.status == 'connected'){
    this.getFriends();
   }else if (response.status === 'not_authorized') {
         // the user is logged in to Facebook, 
       //     // but has not authenticated your app
   }else{
     FB.login(function(res){
       if(res.authResponse){
         this.getFriends();
       }
     }.bind(this));
   }
  }.bind(this));
};

Groubook.prototype = {
  getFriends: function(){
     FB.api(
      { method: 'fql.query'
      , query: 'select name, birthday_date, activities, interests from user where uid in (select uid2 from friend where uid1=me())'}
      , function(data) {
        this.findGifts(data);
      }.bind(this));
  }
, findGifts: function(friends){
    for(var i in friends){
      if(friends[i].birthday_date){
        birthday = this.parseDate(friends[i].birthday_date);
        friends[i].birthday_date = birthday;
        friends[i].days_til = this.daysTil(birthday);
        if(friends[i].days_til < 30 && friends[i].days_til > -2){
         this.friends.push(friends[i]);
        }
      }
    }
    console.log(this.friends);
    this.getDeals('deal');
  }
, parseDate: function(date){
    return new Date(date);
  }
, daysTil:  function(date){
    var date = new Date(date);
    var now = new Date();
    date.setFullYear(now.getFullYear());
    if (date.getMonth() <= now.getMonth() && date.getDate() < now.getDate()){
      date.setFullYear(now.getFullYear()+1);
    }
    var diff = date.getTime() - now.getTime();
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  }
, getDeals: function(className){
    this.deals = {};
    var dealNodes = document.getElementsByClassName(className);
      for( var i in dealNodes){
        if(typeof(dealNodes[i]) === 'object'){
        var personas = [];
        console.log(typeof(dealNodes[6]));
        var personaNodes = dealNodes[i].getElementsByClassName('persona');
        for( var j in personaNodes){
          var kids = personaNodes[j].childNodes
          if(kids && typeof(kids[1]) != 'function'){
            personas.push(kids[1].firstChild.nodeValue);
          }
        }
        this.deals[i] = {personas: personas, deal: dealNodes[i]};
      }
    };
  }
}
f = new Groubook();
