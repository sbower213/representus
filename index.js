var express = require('express');
var bodyParser = require('body-parser');
//var logger = require('morgan');
var exphbs = require('express-handlebars');
var dataUtil = require("./data-util");
var _ = require('underscore');
var request = require('request');
var nodemailer = require('nodemailer');
var async = require('async');

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
});

app.get('/contact/:id', function(req, res) {
	res.render('contact', {bioguide_id: req.params.id});
});

app.post('/contact', function(req, res) {
	var subject = req.body.subject;
	var message = req.body.message;
	var repid = req.body.repid;
	
	getJsonFromJsonP("https://congress.api.sunlightfoundation.com/legislators?bioguide_id="+repid,function(err,data){
		var result = data.results[0];
		console.log(data);
		//res.redirect("mailto:"+result.oc_email+"?subject="+subject+"&body="+message);
		
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: "represent.us.contact@gmail.com",
				pass: "memes.gov"
			}
		});
		
		var mail = {
			//can replace the name with anything
			from: '"Represent Us!" <represent.us.contact@gmail.com>',
			//to: result.oc_email,
			to: 'represent.us.contact@gmail.com',
			subject: subject,
			text: message+'\n\n sent to: '+result.oc_email
		};
		
		transporter.sendMail(mail, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
		});
		
		res.render('contactsent', {oc_email: result.oc_email});
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
            getJsonFromJsonP("https://www.govtrack.us/api/v2/vote_voter/?person="+person.govtrack_id+"&limit=5&order_by=-created&format=json&fields=vote__id,created,option__value,vote__category,vote__chamber,vote__question,vote__number",function(err,data){
                //console.log(data.objects);
                res.render('person',{
                    person: person,
                    contributions: contributions,
                    votes: data.objects
                }) 
            });
        });
    });
	
	/*getJsonFromJsonP("https://api.propublica.org/congress/v1/members/"+_repid+"/votes.json",function(err,data){
        console.log(data);
    });*/
    
});
				
app.post('/search', function(req, res) {
    //console.log(req.body.zip);
    //var results
    _zipcode = req.body.zip;
	
<<<<<<< HEAD
	getJsonFromJsonP("https://congress.api.sunlightfoundation.com/legislators?bioguide_id="+repid,function(err,data){
		var result = data.results[0];
		//console.log(data);
		//res.redirect("mailto:"+result.oc_email+"?subject="+subject+"&body="+message);
		
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: "represent.us.contact@gmail.com",
				pass: "memes.gov"
			}
		});
=======
	function callback2(err, results){
		return results;
	}
	
    getJsonFromJsonP("https://congress.api.sunlightfoundation.com/legislators/locate?zip="+_zipcode,function(err,data){
        console.log(data);
>>>>>>> origin/master
		
		async.waterfall([
		
			function(callback){
				getJsonFromJsonP("https://congress.api.sunlightfoundation.com/legislators/locate?zip="+_zipcode,function(err,data){
					callback(null, data);
				});
			},
			function(data, callback){
				async.map(data.results, function(item, callback2){
					console.log(item);
					var curr = item;
					var name = curr.first_name;
					name += curr.middle_name != null ? "_"+curr.middle_name : "";
					name += "_"+curr.last_name;
					name += curr.name_suffix != null ? "_"+curr.name_suffix : "";
					
					getJsonFromJsonP("https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&redirects=1&titles="+name,function(err,returned){
						console.log(name);
						console.log(returned.query.pages);
						
						//hack around b/c wikipedia api
						var bio_fields = [];
						for(var p in returned.query.pages){
							bio_fields.push(returned.query.pages[p]);
						} 
						
						item.bio = bio_fields[0].extract;
						callback2(null, item);
					});
					
				}, function(err, results){
					callback(null, results);
				});
			}
			
		], function(err, result){
			res.render('zipcode',{
				reps: result
			});
		});
        
    });
    
});

app.listen(3000, function() {
    console.log('House of Representatives listening on port 3000!');
});
