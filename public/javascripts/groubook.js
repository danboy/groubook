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
        if(friends[i].days_til < 356 //this can be limited. Right now, we're taking the entire year. 
          && friends[i].days_til > -2
          && (friends[i].activities != ""
          || friends[i].interests != "")) {
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
        var personas = [];
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
, showGiftDeals :function(){
    var localDealsContainer = $('#local');
    var giftDealsContainer = localDealsContainer.clone();
    giftDealsContainer.attr('id', 'gifts');
    giftDealsContainer.removeClass('local');
    giftDealsContainer.addClass('gifts');
    giftDealsContainer.find('.group_title').html('Gift Deal Suggestions for Facebook Friends');
    var giftDeals = giftDealsContainer.find('.deals .hoverable');
    //select all deals
    var giftDealsClone = giftDeals.clone();
    giftDealsContainer.find('.deals').replace("");
    
    //build gift deal container
    localDealsContainer.before(giftDealsContainer);
    
    //filter all deals by gift deals per facebook user
    var giftIdeas = {};
    console.log('this.friends');
    console.log(this.friends);
    _(this.friends).each(function(friend) {
      console.log('friend');
      console.log(friend);
      giftIdeas[friend.name] = [];
      var keywords = (friend.activities + " " + friend.interests).split(/[ :,]/);
      keywords = _(keywords).map(function(keyword) {return keyword.toLowerCase()});
      keywords = _(keywords).reject(function(keyword) {return keyword.length <= 2});
      keywords = _(keywords).without('the');
      console.log('keywords');
      console.log(keywords);
      _(keywords).each(function(word) {
        _(giftDealsClone).each(function(deal, dealIndex) {
          var potentialDeal = $(deal).find('.info .title a')[0];
          if (potentialDeal && potentialDeal.innerHTML.toLowerCase().indexOf(word) != -1) {
            giftIdeas[friend.name].push(deal);
          }
        });
      });
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
