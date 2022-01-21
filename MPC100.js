function init(){
    script.setUpdateRate(1);
}

var expectedReturn = "";
var doRetry = 0;
var lastUpdate = 0;
var retryReturn = "";
var retryMessage = "";

function update(deltaTime){
    if(doRetry>0){
        var time = util.getTime();
        if(time-lastUpdate >= local.parameters.autoRetryInterval.get()){
            local.send(retryMessage);
            doRetry--;
            lastUpdate = time;
        }
    }
}

function moduleValueChanged(value)
{
    if(value.is(local.values.rs232)){
        var awnser = local.values.rs232.get();
        if(awnser== "POWER OFF"){
            local.values.power.set("OFF");
        }
        if(awnser == expectedReturn){
            local.values.latestCommand.commandAck.trigger();
            expectedReturn = "";
        }else if(awnser == "INVALID!"){
            local.values.latestCommand.invalidCommand.trigger();
        }

        if(awnser == retryReturn){
            doRetry = 0;
            retryReturn = "";
            retryMessage = "";
        }
    }else if(value.is(local.values.button)){
        var awnser = local.values.button.get();
        if(awnser== "POWER OFF"){
            local.values.power.set("OFF");
        }
    }else if(value.is(local.values.ir)){
        var awnser = local.values.ir.get();
        if(awnser== "POWER OFF"){
            local.values.power.set("OFF");
        }
    }else if(value.is(local.values.power)){
        if(local.values.power.get() == "ON"){
            local.values.latestCommand.commandAck.trigger();
            doRetry = 0;
            expectedReturn = "";
            retryReturn = "";
            retryMessage = "";
        }
    }
}

function sendCommand(cmd, address, retry) {
    var strAddress = address;
    if(address<10) {
         strAddress = '0' + strAddress;
    }

    if(cmd == "OK"){
        expectedReturn = "ENTER";
    }else if(cmd == "POWER"){
        expectedReturn = "POWER OFF";
    }else if(cmd == "FWD"){
        expectedReturn = "FORWARD";
    }else if(cmd == "REV"){
        expectedReturn = "BACK";
    }else if(cmd == "REP"){
        expectedReturn = "REPEAT";
    }else{
        expectedReturn = cmd;
    }

    local.values.latestCommand.command.set(cmd);
    local.values.latestCommand.address.set(address);

    var msg = "@"+strAddress+":"+cmd+"$";

    local.send(msg);

    if(retry) {
        doRetry = 10;
        retryReturn = expectedReturn;
        retryMessage = msg;
    lastUpdate = util.getTime();
    }
}

function pressButton(button, address, cmd, retry) {
    var strAddress = address;
    if(address<10) {
         strAddress = '0' + strAddress;
    }

    var strButton = button;
    if(button<10) {
         strButton = '0' + strButton;
    }

    expectedReturn = button + " => " + cmd;
    local.values.latestCommand.command.set(strButton);
    local.values.latestCommand.address.set(address);

    var msg = "@"+strAddress+":"+strButton+"$";

    local.send(msg);

    if(retry) {
        doRetry = 10;
        retryReturn = expectedReturn;
        retryMessage = msg;
    lastUpdate = util.getTime();
    }
}

function customMessage(msg) {
    local.send(msg);
}
