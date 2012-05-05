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
      , query: 'select name, birthday_date, activities, interests, sports, games, music, movies, books, tv from user where uid in (select uid2 from friend where uid1=me())'}
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
        if(friends[i].days_til < 90 //doing the whole year for now... can be limited in the future
          && friends[i].days_til > -2
          && (friends[i].activities != ""
          || friends[i].interests != ""
          || friends[i].games != ""
          || friends[i].music != ""
          || friends[i].movies != ""
          || friends[i].books != ""
          || friends[i].tv != ""
          || friends[i].sports.length != 0
          )) {
         this.friends.push(friends[i]);
        }
      }
    }
    //this.getDeals('deal');
    this.showGiftDeals();
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
        this.deals[i] = {personas: this.getPersonas(dealNodes[i]), deal: dealNodes[i]};
      }
    };
  }
, getPersonas: function(dealNode) {
  var personas = [];
  var personaNodes = $(dealNode).find('.persona');
  _(personaNodes).each(function(personaNode) {
    var kids = personaNode.childNodes
    if(kids && typeof(kids[1]) != 'function'){
      personas.push(kids[1].firstChild.nodeValue);
    }
  });
  return personas;
}
, showGiftDeals :function() {
    var self = this;
    var localDealsContainer = $('#local');
    var giftDealsContainer = localDealsContainer.clone();
    giftDealsContainer.attr('id', 'gifts');
    giftDealsContainer.removeClass('local');
    giftDealsContainer.addClass('gifts');
    giftDealsContainer.find('.group_title').html('Gift Deal Suggestions for Facebook Friends');
    var giftDeals = giftDealsContainer.find('.deals .hoverable');
    //select all deals
    var giftDealsOriginalClone = giftDeals.clone();
    giftDealsContainer.find('.deals').replace("");
    
    //build gift deal container
    localDealsContainer.before(giftDealsContainer);
    
    //filter all deals by gift deals per facebook user
    var giftIdeas = {};
    _(this.friends).each(function(friend) {
      console.log('friend');
      console.log(friend);
      giftIdeas[friend.name] = [];
      var keywords = _([friend.activities, friend.interests, friend.games, friend.music, friend.movies, friend.books, friend.tv]).union(friend.sports).join(' ').split(/[ :,()]/);
      keywords = _(keywords).map(function(keyword) {return keyword.toLowerCase()});
      keywords = _(keywords).reject(function(keyword) {return keyword.length <= 2});
      keywords = _(keywords).without('the','and','for','like','free','your');
      keywords = _(keywords).uniq();
      console.log('keywords');
      console.log(keywords);
      var giftDealsClone = $($(giftDealsOriginalClone).clone()).toArray();
      _(keywords).each(function(word) {
        _(giftDealsClone).each(function(deal, dealIndex) {
          if ($(deal).text().toLowerCase().indexOf(word) != -1) {
            giftIdeas[friend.name].push($(deal).clone());
            giftDealsClone.splice(dealIndex, 1);
          }
        });
      });
      giftIdeas[friend.name] = giftIdeas[friend.name].slice(0,3);
    });
    
    //insert gift deals
    console.log(giftIdeas);
    _(this.friends).each(function(friend) {
      var container = $('<div class="deals"></div>');
      container.append("<h4>" + friend.name + "</h4>");
      $(giftIdeas[friend.name]).removeClass('last');
      _(giftIdeas[friend.name]).each(function(gift, giftIndex) {
        if ((giftIndex % 3) == 2) $(gift).addClass('last');
        container.append(gift);
      });
      if (giftIdeas[friend.name].length > 0) giftDealsContainer.append(container);      
    });
  }
}
f = new Groubook();
