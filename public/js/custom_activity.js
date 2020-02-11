define(['postmonger'], (Postmonger) => {


    const connection = new Postmonger.Session();

    const steps = [
    { "label": "Configuración", "key": "setup" },
    { "label": "Resumen", "key": "summary" }
    ];

    const inArguments = [];



    //Index Tag Id's

    let summary = "#summary";
    let setup = "#setup";
    let noDE = "#noDE";
    let select01 = "#select-01";
    let select02 = "#select-02";
    let select03 = "#select-03";
    let select04 = "#select-04";
    let select05 = "#select-05";
    let select06 = "#select-06";


    //Global Variable
    let eventDefinitionKey = null;
    let payload = {};
    let step = steps[0].key;
    var schema = {};


    //Input Names


    $(window).ready(onRender);


    connection.on('initActivity', initialize);


    connection.on('requestedTriggerEventDefinition', onRequestEventDefinition);


    connection.on('requestedSchema', onRequestSchema);


    connection.on('clickedNext', onClickedNext);


    connection.on('clickedBack', onClickedBack);


    connection.on('gotoStep', onGotoStep);



    //This function executes render the activity
    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestSchema');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }



    
    function initialize(data) {
        if(data) {
            payload = data;
        }
        showStep(null);
        console.log('initialize', data);
    }




    function onClickedNext() {
        console.log("onClickedNext");

        if(currentStep.key === 'summary') {
            console.log('Saving');
            //save();
        } else {
            if(validateSelectors()){
                console.log('Valid Message');
                connection.trigger('nextStep');
            }else{
                console.log('invalid Message');
               
            }
            
        }
    }


    function onClickedBack() {
        console.log("onClickedBack");
        connection.trigger('prevStep');
    }



    function onGotoStep(step) {

        currentStep = step;
        console.log('currentStep', currentStep.key);
        showStep(step);
        

    }







    function onRequestSchema(data) {
        console.log('schemaDefinition', data);
        schema = data['schema']; 
        /*
        if (schema.length() == 0){
            $(noDE).show();
            disableButtonNext(false);
        }else{
            $(noDE).hide();
            disableButtonNext(true);
        }
        */
        fillPlaceholderList(schema);    
    }

    function disableButtonNext(enabledStatus){
        connection.trigger('updateButton', {
            button: 'next',
            text: 'Next',
            enabled: enabledStatus
        });
    }

    
    function onRequestEventDefinition(eventDefinition) {
        console.log('eventDefinition', eventDefinition);
        eventDefinitionKey = eventDefinition.eventDefinitionKey;
        console.log('eventDefinitionKey', eventDefinitionKey);
        
    }

    function save() {

        configureInArguments();
        console.log("ON SAVE: " + JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }


    function configureInArguments() {
        var inArguments = [];
        if (schema !== undefined && schema.length > 0) {
            for (var i in schema) {
                var field = schema[i];
                if (isEventDataSourceField(field)) {
                    var fieldName = extractFieldName(field);
                    var prefixedFieldName = 'com.globant.event.data.' + fieldName;
                    saveFieldToInArguments(field, prefixedFieldName, inArguments);
                }
            }
        }
        payload['metaData'].isConfigured = true;       
        payload['arguments'].execute.inArguments = inArguments;
    }


    function validateSelectors(){
       //TODO Configure validation of selectors
       return true;
    }



    function fillPlaceholderList(schema) {
        $(select01).html('<option value="">Seleccione el campo</option>');
        $(select02).html('<option value="">Seleccione el campo</option>');
        $(select03).html('<option value="">Seleccione el campo</option>');
        $(select04).html('<option value="">Seleccione el campo</option>');
        $(select05).html('<option value="">Seleccione el campo</option>');
        $(select06).html('<option value="">Seleccione el campo</option>');
        if (schema !== undefined && schema.length > 0) {
            //console.log("With Fields");
            for (var i in schema) {
                //console.log("Index Schema: " + i);
                var field = schema[i];
                var fieldName = extractFieldName(field);
                if (isEventDataSourceField(field)) {

                    $(select01).append('<option value="%%'+fieldName+'%%">' + fieldName + '</option>');
                    $(select02).append('<option value="%%'+fieldName+'%%">' + fieldName + '</option>');
                    $(select03).append('<option value="%%'+fieldName+'%%">' + fieldName + '</option>');
                    $(select04).append('<option value="%%'+fieldName+'%%">' + fieldName + '</option>');
                    $(select05).append('<option value="%%'+fieldName+'%%">' + fieldName + '</option>');
                    $(select06).append('<option value="%%'+fieldName+'%%">' + fieldName + '</option>');
                    
                    
                }
            }
        }
    }


    function fillPhoneCombobox(schema) {
        console.log('Fill Phone');
        if (schema !== undefined && schema.length > 0) {
            for (var i in schema) {
                var field = schema[i];
                var fieldName = extractFieldName(field);
                var fieldValue = "{{" + field.key + "}}";
                var fieldType = field.type;
                if(fieldType == "Phone"){                    
                    if (isEventDataSourceField(field)) {
                        var selected = fieldValue === phoneSelectorValue;
                        $(phoneSelector).append(new Option(fieldName, fieldValue, false, selected));
                    }
                }
            }
        }
    }

    function extractFieldName(field) {
        var index = field.key.lastIndexOf('.');
        return field.key.substring(index + 1);
    }

    function isEventDataSourceField(field) {
        return !field.key.startsWith('Interaction.');
    }

    function saveFieldToInArguments(field, fieldName, inArguments) {
        var obj = {};
        obj[fieldName] = "{{" + field.key + "}}";
        inArguments.push(obj);
    }


    function showStep(step) {
        $('.step').hide();


        if (step == null) {
            $(setup).show();
            connection.trigger('updateButton', {
                button: 'next',
                text: 'Next',
                enabled: validateSelectors() 
            });
            connection.trigger('updateButton', {
                button: 'back',
                visible: false
            });
        }

        
/*
        switch(currentStep.key) {
            case 'message':
            $('#message').show();
            connection.trigger('updateButton', {
                button: 'next',
                text: 'Next',
                enabled: validateSelectors() 
            });
            connection.trigger('updateButton', {
                button: 'back',
                visible: false
            });
            break;
            case 'review':
            $('#review').show();
            connection.trigger('updateButton', {
                button: 'back',
                visible: true
            });
            connection.trigger('updateButton', {
                button: 'next',
                text: 'Done',
                visible: true
            });
            break;
        }
        */
    }

    function getMessageIfExists(data){
       data.arguments.execute.inArguments.forEach(function(obj) { 

        if (obj.message != undefined) {
            message = obj.message;
            console.log("OLD MESSAGE " + message);
            $(messageText).val(message);
        }else if (obj.phone != undefined) {
            phoneSelectorValue = obj.phone;
            console.log("OLD Phone " + phoneSelectorValue);
            $(phoneSelector).val(phoneSelectorValue);
        
        }
    });


   }


   

});