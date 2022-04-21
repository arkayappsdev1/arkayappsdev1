var FCM = require('fcm-node');
const dotenv = require('dotenv');


const pushNotifications = async (req, res) => {

    const Tokens = req.body.token
    const title = req.body.title
    const body = req.body.body

     if(!Tokens || !title || !body) {
       return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2_missing_value"),
       })
     }
    var serverKey = process.env.SERVER_KEY; 
    var fcm = new FCM(serverKey);

    var message = { 
        
        to: Tokens, 
        collapse_key: 'green',
        
        notification: {
            title: title,
            body: body 
        },
        
        // data: {  
        //  //you can send only notification or only data(or include both)
        //     my_key: 'my value',
        //     my_another_key: 'my another value'
        // }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(response);
        }
    });

}

module.exports = pushNotifications