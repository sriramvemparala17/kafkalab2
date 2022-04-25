// var connection =  new require('./kafka/connection.js');
import {connection} from './kafka/connection.js'
import config from '../config/config'
import mongoose from 'mongoose'

// Connection URL
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true })
mongoose.connection.on('error', () => {
  console.log("unable to connect to database");
  throw new Error(`unable to connect to database: ${config.mongoUri}`)
})

// var connection = new ConnectionProvider();

//topics files
// var signin = require('./services/signin.js');
// var Books = require('./services/books.js');
import Auth from './services/auth.js'
import Product from './services/product.js'
import Order from './services/order.js'
import Shop from './services/shop.js'
import User from './services/user.js'

function handleTopicRequest(topic_name,fname){
    //var topic_name = 'root_topic';
    var consumer = connection.getConsumer(topic_name);
    var producer = connection.getProducer();
    console.log('server is running ');
    consumer.on('message', function (message) {
        var data = JSON.parse(message.value);
        console.log('message received for topic:message',topic_name, data);
        
        fname.handle_request(data.data, function(err,res){
            console.log('after handle_request',res);
            var payloads = [
                { 
                    topic: data.replyTo,
                    messages:JSON.stringify({
                        correlationId:data.correlationId,
                        data : res,
                        error : err,
                    }),
                    partition : 0
                }
            ];
            producer.send(payloads, function(err, data){
                console.log('producer.send',data);
            });
            return;
        });
        
    });
}
// Add your TOPICs here
//first argument is topic name
//second argument is a function that will handle this topic request
// handleTopicRequest("post_book",Books)

handleTopicRequest("auth",Auth)
handleTopicRequest("product",Product)
handleTopicRequest("order",Order)
handleTopicRequest("shop",Shop)
handleTopicRequest("user",User)
