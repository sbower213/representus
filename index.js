var express = require('express');
var bodyParser = require('body-parser');
//var logger = require('morgan');
var exphbs = require('express-handlebars');
var dataUtil = require("./data-util");
var _ = require('underscore');
var request = require('request');

// JSONP request handler from: http://stackoverflow.com/questions/9060270/node-http-request-for-restful-apis-that-return-jsonp
var getJsonFromJsonP = function (url, callback) {
request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var jsonpData = body;
    var json;
    //if you don't know for sure that you are getting jsonp, then i'd do something like this
    try
    {
       json = JSON.parse(jsonpData);
    }
    catch(e)
    {
        var startPos = jsonpData.indexOf('({');
        var endPos = jsonpData.indexOf('})');
        var jsonString = jsonpData.substring(startPos+1, endPos+1);
        json = JSON.parse(jsonString);
    }
    callback(null, json);
  } else {
    callback(error);
  }
})
};

var app = express();

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
app.use('/congress_pictures_files', express.static('congress_pictures_files'));

var _DATA = dataUtil.loadData().objects;

app.get('/', function(req, res) {
	res.render('homepage',{});
})

app.get('/states', function(req, res) {
	 
	var states = [];
	var origStates = dataUtil.states;
	
	for(var state in origStates){
		var linkName = state.toLowerCase().replace(new RegExp(' ', 'g'), '-');
		states.push({linkName:linkName, name:state});
	}
	
    res.render('allstates', { states:states });
})

app.get('/party/:party', function(req, res) {
	var party = req.params.party;
	
	var representatives = _.filter(_DATA, function(obj){
		return obj.party.toUpperCase() == party.toUpperCase();
	});
		
	party = party + 's';
	party = party.toUpperCase();
	
    res.render('representatives', {
        party:party,
		representatives:representatives
    });
})

app.get('/state/:name', function(req, res) {
	 
	var name = req.params.name;
	name = name.substring(0,1).toUpperCase() + name.substring(1);
	while(name.indexOf('-') != -1){
		var index = name.indexOf('-');
		name = name.substring(0, index) + ' ' + name.substring(index + 1);
		name = name.substring(0, index+1) + name.substring(index+1,index+2).toUpperCase() + name.substring(index+2);
	}
	
	var state = dataUtil.states[name];
	
	var representatives = _.filter(_DATA, function(obj){
		return obj.state == state;
	});
	
	var republicans = _.filter(representatives, function(obj){
		return obj.party == "Republican";
	});
	
	var democrats = _.filter(representatives, function(obj){
		return obj.party == "Democrat";
	});
	
	var hasRepublicans = republicans.length > 0;
	var hasDemocrats = democrats.length > 0;
	
    res.render('state', {
        state: name,
		republicans: republicans,
		democrats: democrats,
		hasRepublicans: hasRepublicans,
		hasDemocrats: hasDemocrats
    })
})

app.get('/rep', function(req, res) {

    res.render('representatives', {
        party:"ALL REPRESENTATIVES",
		representatives:_DATA
    });
});

app.get('/rep/:repid', function(req, res) {
    var _repid = req.params.repid;
	getJsonFromJsonP("https://congress.api.sunlightfoundation.com/legislators/?bioguide_id="+_repid,function(err,data){
        //console.log(data)
        person = data.results[0]
        
        getJsonFromJsonP("http://www.opensecrets.org/api/?method=candContrib&cid="+person.crp_id+"&apikey=fcfe08573a5871a36bf33d846048cf70&output=json",function(err,data){
            //console.log(data.response.contributors.contributor[0]['\@attributes']);
            var contribs = data.response.contributors.contributor
            var contributions = [];
            for(i = 0; i < contribs.length; i++) {
                contributions.push(contribs[i]['\@attributes'])
            }
            //console.log(contributions)
            res.render('person',{
                person: person,
                contributions: contributions//data.response.contributors.contributor
            })
        });
    });
	
	/*getJsonFromJsonP("https://api.propublica.org/congress/v1/members/"+_repid+"/votes.json",function(err,data){
        console.log(data);
    });*/
    
});

app.post('/search', function(req, res) {
    console.log(req.body.zip);
    //var results
    _zipcode = req.body.zip;
    getJsonFromJsonP("https://congress.api.sunlightfoundation.com/legislators/locate?zip="+_zipcode,function(err,data){
        //console.log(data);
        res.render('zipcode',{
            reps: data.results
        });
    });
    
});

app.listen(3000, function() {
    console.log('House of Representatives listening on port 3000!');
});
