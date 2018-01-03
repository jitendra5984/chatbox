var express = require('express');
var router = express.Router();
var bot = require('apiai');
var restClient = require('../utils/restClient');

var requestParser = require('../components/request/parser');
const processResponse = require('../components/response/responseHandler');
const uuidv1 = require('uuid/v1');

router.post("/", function (req, res) {
    const data = req.body;

    const requestResult = requestParser.parse(req);

    const errors = req.validationErrors();

    if (errors) {
        const result = processResponse(req, errors, false);
        res.send(result);
    } else {
        const context = data['context'];
        const aiProvider = data['aiProvider'];
        const userData = data['data'];

        // Read the configuration for validation rules and apply validation on properties.
        // If validation rules fails, return the error context and terminate the request.

        // Checks for active session or generate new session id
        const sessionId = aiProvider['sessionId'] || uuidv1();
        var apiai = bot(aiProvider['accessToken']);

        // Calls DialogFlow API after data validation is done
        var request = apiai.textRequest(userData['queryText'], {
            sessionId: sessionId
        });

        // Callback on request process
        request.on('response', function (response) {
            // Validation on Score and further API call decision.

            const parameters = response.result.parameters;
            let params = '?';

            for (const key in parameters) {
                const val = `${parameters[key]}` ? `${parameters[key]}` : null;
                params += `${key}=${val}` + '&';
            }

            params = params.slice(0, - 1);
            restClient.get(params).then(data => {
                const result = processResponse(req, response, data, true);
                res.send(result);
            });
        });

        // Callback on Server Error
        request.on('error', function (error) {
            const result = processResponse(req, error, false);
            res.send(result);
            //throw new Error(error.responseBody);
        });

        request.end();
    }
});

module.exports = router;
