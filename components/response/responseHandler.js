
function processResponse(request, response, apiOutput, isSuccess) {
    const data = request.body;
    var result = {};

    result.context = {
        "timestamp": response.timestamp || new Date(),
        "version": data['context']['version']
    };

    result.output =  apiOutput;

    result.result = {
        "message": isSuccess ? 'SUCCESS' : 'FAIL',
        "statusCode": isSuccess ? 'SUC000' : (request.validationErrors().length > 0 ? 'REQ_VAL' : 'SER_ERR'),
        "error": {
            "errorType": isSuccess ? response.status.code : response.statusCode,
            "errorDetails": ''
        }
    };

    result.aiResponse = {
        "aiEngine": "dialogflow",
        "response": response
    }

    return result;
}

module.exports = processResponse;
