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
        disableButtonNext(validateSelectors());
        console.log('initialize', data);
    }




    function onClickedNext() {
        console.log("onClickedNext");

        if(currentStep.key === 'summary') {
            console.log('Saving');
            save();
        } else {
            if(validateSelectors()){
                console.log('Valid fields');
                connection.trigger('nextStep');
            }else{
                console.log('invalid fields');
               
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
        if (schema.length == 0){
            $(noDE).show();
            disableButtonNext(false);
        }else{
            $(noDE).hide();
            disableButtonNext(true);
        }
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
        //Armar el JSON
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
                    var prefixedFieldName = 'com.aeromexico.event.data.' + fieldName;
                    saveFieldToInArguments(field, prefixedFieldName, inArguments);
                    
                }
            }
        }

        inArguments.push({ "email": $(select01).val() });
        inArguments.push({ "firstname": $(select02).val() });
        inArguments.push({ "middlename": $(select03).val() });
        inArguments.push({ "lastname": $(select04).val() });     
        inArguments.push({ "UTMC": $(select05).val() });
        inArguments.push({ "UTMS": $(select06).val() });
        
        payload['metaData'].isConfigured = true;       
        payload['arguments'].execute.inArguments = inArguments;
    }

    function validateSelectors(){
        if ($(select01).val() == ""){
            $(select01).focus();
            return false;
        }

        if ($(select02).val() == ""){
            $(select02).focus();
            return false;
        }

        if ($(select03).val() == ""){
            $(select03).focus();
            return false;
        }

        if ($(select04).val() == ""){
            $(select04).focus();
            return false;
        }


        if ($(select05).val() == ""){
            $(select05).focus();
            return false;
        }

        if ($(select06).val() == ""){
            $(select06).focus();
            return false;
        }       
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
        $(select01).change(validateOnChange);
        $(select02).change(validateOnChange);
        $(select03).change(validateOnChange);
        $(select04).change(validateOnChange);
        $(select05).change(validateOnChange);
        $(select06).change(validateOnChange);
    }

    function validateOnChange(){
        disableButtonNext(validateSelectors());
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

        

        switch(currentStep.key) {
            case 'setup':
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
            break;
            case 'summary':
            $(summary).show();
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
        
    }


   

});



