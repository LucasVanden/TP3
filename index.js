var AWS = require('aws-sdk');
var uuid = require("uuid/v1");

var handler = async (event, context, callback) => {
  var dynamodb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    region: 'us-west-2',
    endpoint: 'http://dynamodb:8000',
    credentials: {
      accessKeyId: '2345',
      secretAccessKey: '2345'
    }
  });
  var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    service: dynamodb
  }); 

  let id = (event.pathParameters || {}).envio || false;
  switch(event.httpMethod) {
//-------------------------------------------------------------
case "GET":

      if (id) {

	var params = {
    	TableName: 'Envio',
    	KeyConditionExpression: 'id = :numeroid',
    	ExpressionAttributeValues: { ':numeroid': id},
    	ScanIndexForward: true, 
    	Limit: 3, 
    	ConsistentRead: false, 
    	Select: 'ALL_ATTRIBUTES', 
    	ReturnConsumedCapacity: 'NONE', 
	};

	docClient.query(params, function(err, data) {
	    if (err) return(err); 
	    else {
		callback(null, { body: JSON.stringify(data.Items)});
		console.log(JSON.stringify(data.Items));
		return;
	         }	
	});
      }else{
	var params = {
		TableName: 'Envio',
		IndexName: 'pendiente'
		};
	dynamodb.scan(params, function(err, data) {
		if (err) return(err); // an error occurred
		else {
		    callback(null, { body: JSON.stringify(data.Items)});
		    console.log(JSON.stringify(data.Items));
		return;
		}	
	});
       }

//-------------------------------------------------------------
case "POST":
	if (id) {
	var params = {
	    TableName: 'Envio',
	    Key: {id: id,},
	    UpdateExpression: ' REMOVE pendiente ',
	};
	docClient.update(params, function(err, data) {
	    if (err) (err); // an error occurred
	    else (data); // successful response
	});
	}
	else{
	   var params = {
	    	TableName: 'Envio',
	    	Item: { 
	  	id: uuid(),
            	fechaAlta: Date().toString(),
		destino: JSON.parse(event.body).destino,
            	email: JSON.parse(event.body).email,
            	pendiente: "X"
	   	},
	    ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
	    ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
	    ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
	    };

	docClient.put(params, function(err, data) {
	    if (err) (err); // an error occurred
	    else (data); // successful response
	});      
	}
//-------------------------------------------------------------
    default:
      console.log("Metodo no soportado (" + event.httpMethod+ ")");
      callback(null, { statusCode: 501 });
}



}
exports.handler = handler;
