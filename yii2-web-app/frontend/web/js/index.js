const check_port_host_xml_filepath = (wssHost, wssPort, xmlFilepath) => {
    /*
        checkWssHost
        checkWssPort
        checkXmlFilepath
        POST create web-socket session
        SUBSCRIBE to web-socket heartbeat event
    */

    // return true if it is ok OR false
    const checkWssHost = (wssHost) => {
        const ipv4_host_regexp = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;

        return wssHost.match(ipv4_host_regexp) != null;
    }

    const checkWssPort = (wssPort) => {
        const ipv4_port_regexp = /\d{2,5}/;

        return wssPort.match(ipv4_port_regexp) != null;
    }

    const checkXmlFilepath = (xmlFilepath) => {
        const xml_filepath_regexp = /^.*\.xml$/;

        return xmlFilepath.match(xml_filepath_regexp) != null;
    }

    const wssHostIsOk = () => {
        return true;
    }

    // checkWssHost
    const wssHostIsWrong = () => {
        $('#verify-host-and-port-and-xml').text("Wss host is unacceptable. Please enter the value manually following the pattern '0.0.0.0'.");
        $('.ui.modal').modal({blurring: true}).modal('show');

        return false;
    }

    const wssPortIsOk = () => {
        return true;
    }

    const wssPortIsWrong = () => {
        $('#verify-host-and-port-and-xml').text("Wss port is unacceptable. Please enter the value manually following the pattern '1234'.");
        $('.ui.modal').modal({blurring: true}).modal('show');

        return false;
    }

    const xmlFilepathIsOk = () => {
        return true;
    }

    const xmlFilepathIsWrong = () => {
        $('#verify-host-and-port-and-xml').text("Xml filepath is unacceptable. Please enter the value manually following the pattern '*.xml'.");
        $('.ui.modal').modal({blurring: true}).modal('show');

        return false;
    }

    const wssHostResult = checkWssHost(wssHost) ? wssHostIsOk() : wssHostIsWrong();

    const wssPortResult = checkWssPort(wssPort) ? wssPortIsOk() : wssPortIsWrong();

    const xmlFilepathResult = checkXmlFilepath(xmlFilepath) ? xmlFilepathIsOk() : xmlFilepathIsWrong();

    return wssHostResult && wssPortResult && xmlFilepathResult;
}

$(function() {
    $('#standard_calendar').calendar();

    alert("OK");

});