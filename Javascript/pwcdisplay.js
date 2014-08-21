//  display support code for the PWC IETM application.
//
//   (c)2011 Parametric Technology Inc.
//
var revisionColor = "#DDDDDD";

//var sbspbPrefix = "http://webtop.pwc.ca/ecmwebtop65/custom/pwcgui/corp/library/getDCTMdoc/getDCTMdoc.jsp?docbase=techpubs&";  // original line
var sbspbPrefix = "/technical-publications/bulletins/show/"; // SR170565: modified line
var soaDisclaimerPath = "/soaDisclaimer.txt";
var graphicDisclaimerPath = "/graphicDisclaimer.txt";
var graphicDisclaimer = 'P&amp;WC Proprietary - subject to restrictions in Technical Data Agreement';
var soaDisclaimer = "This manual contains proprietary information of Pratt " + 
"&amp; Whitney Canada Corp. (  P&amp;WC  ), which P&amp;WC provides in " +
"confidence and solely for the purposes of supporting engine certification " +
"and providing applicable information regarding the proper use, maintenance, " +
"inspection, repair, servicing and parts application of P&amp;WC products "+ 
"and services, as directed therein. Neither this manual nor any information " + 
"in it may be disclosed to others, or used for any other purpose, " + 
"including, without limitation, to design, create, develop, reproduce, " + 
"manufacture or derive any design, part, product, material, process, " + 
"modification, configuration change or repair, or obtain FAA or other " + 
"government approval to do so. Possession and use of this manual is " + 
"also subject to the restrictions set out in P&amp;WC fs Technical Data " + 
"Agreement (a copy of which may be obtained by contacting P&amp;WC " + 
"Technical Publications). The contents of this manual may be subject to " +
"export control laws. Unauthorized export or re-export of the manual, or " +
"parts thereof, is prohibited. By accepting and possessing this manual, you " + 
"agree to be bound by the foregoing terms. <br/>If a Government agency " + 
"or department intends to disclose any information, written notice should be given to: " +
"VP - Legal Services, Pratt &amp; Whitney Canada Corp., 1000 Marie-Victorin " + 
"(01BE5), Longueuil, Quebec J4G 1A1.";

var enMonths=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

var haveSoaDisclaimer = false;
var haveGraphicDisclaimer = false;
var gFigRef;

// globals retrieved from metadata

var metaChapter = "";
var metaSection = "";
var metaSubject = "";
var metaPbn = "";
var metaModelNo = "";
var metaManualServiceBulletinNo = "";
var metaRevNo = "";
var metaPointRev = "0";
var metaIssueRevisionDate = "";
var metaManualType = "";
var metaEngineFamily = "";
var metaPbTitle = "";

function manType(manCode) {
    
   
    var manShortCode = manCode.substring(0,2);
    
    switch (manShortCode) {
        case "mm":
        return "MAINTENANCE MANUAL";
        case "em":
        return "ILLUSTRATED PARTS CATALOG";
        case "oh":
        return "OVERHAUL MANUAL";
        case "ip":
        return "ILLUSTRATED PARTS CATALOG";
        case "ep":
        return "ILLUSTRATED PARTS CATALOG";
        case "ci":
        return "CLEANING INSPECTION REPAIR (CIR) MANUAL";
        case "lm":
        return "LINE MAINTENANCE MANUAL";
        case "tm":
        return "MAINTENANCE MANUAL";
        default:
        return "INTERACTIVE ELECTRONIC TECHNICAL MANUAL";
    }
}

function convertDate(inDate) {
    
    var month = parseInt(inDate.substring(4,6),10);
    month--;
    return enMonths[month] + " " + inDate.substring(6,8) + "/" + 
      inDate.substring(0,4);
}

function pwcCurrentDate() {
    // This function returns the current Date in PWC's specific format, which is: DD MM/YY
    //
    var today = new Date();
    var fullYear = today.getFullYear().toString();
    
    return today.getDate() + ' ' + enMonths[today.getMonth()] + '/' + fullYear.substring(2);
}

function countSheets(htmlString) {
    var cSheet = "(SHEET X OF Y)";
    var idx = 0;
    var num = 0;
    var repStr;
    var newBlock = htmlString;
    while (idx < htmlString.length) {
        
        var foundAt = htmlString.substring(idx).indexOf(cSheet);
        if (foundAt > 0) {
            num++;
            idx += foundAt+cSheet.length;
        }
        else {
            break;
        }
    }
    for (var i = 1; i < num+1; i++) {
        // If there is only one, just replace the sheet string with a blank.
        if (num == 0) {
            repStr = "";
        }
        else {
            repStr = "(SHEET " + i + " OF " + num + ")";
        }
        newBlock = newBlock.replace(cSheet,repStr);
    }
    return newBlock;
    
}
function setGlobalsFromMeta(inHTML) {
    var name;
    var value;
    var metaRef;
    var metaSearch = document.createElement("div");
    metaSearch.innerHTML = inHTML;
    var allDivs = metaSearch.getElementsByTagName("div");
    for (var i=0; i < allDivs.length; i++) {
        if (allDivs[i].getAttribute('id') == "pwcmetainfo") {
            metaRef = allDivs[i];
            break;
        }
    }
    for (var i=0; i < metaRef.childNodes.length; i++) {
        if (metaRef.childNodes[i].nodeType == 1) { // only get attributes from element            
            name = metaRef.childNodes[i].getAttribute("id");
            value = metaRef.childNodes[i].innerHTML;
            switch (name) {
                case "chapter":
                  metaChapter = value;
                  break;
                case "section":
                  metaSection = value;
                  break;
                case "subject":
                  metaSubject = value;
                  break;
                case "pbn":
                  metaPbn = value;
                  break;
                case "pb-title":
                  metaPbTitle = value;
                  break;
                case "ModelNo":
                  metaModelNo = value;  
                  break;
                case "ManualServiceBulletinNo":
                  metaManualServiceBulletinNo = value;  
                  break;
                case "RevNo":
                  metaRevNo = value;  
                  break;
                case "pointRev":
                  metaPointRev = value;  
                  break;
                case "IssueRevisionDate":
                  metaIssueRevisionDate = value;  
                  break;
                case "manualType":
                  metaManualType = value;
                  break;
                case "engineFamily":
                  metaEngineFamily = value;
                  break;
              }
          }
    }
}

function correctInternalLinks(figRef) {
    
    var figAnchors;
    figAnchors = figRef.getElementsByTagName('a');
    for (var i=0; i < figAnchors.length; i++) {
        if (figAnchors[i].className.indexOf("x--sfe-InternalLink-1-0") >= 0) {
            figAnchors[i].setAttribute('onclick',
              "window.opener.parent.parent.contentFrame.content.location = '" + 
              figAnchors[i].getAttribute('href') + "';");
            figAnchors[i].href = "javascript:void(0)";
        }
    }
}

//called from the document content window as an onclick event
function displayGraphics(figureElementId) {
    
    var figRef;
    var docTitle;
    var inFigRef;
    var tagElements;
    var content;
    
    figRef = document.getElementById(figureElementId);
    
    var startTag = document.getElementsByTagName("body")[0];
    setGlobalsFromMeta(startTag.innerHTML);
    addChangebarsByDocument(document);
    addTableChangebarsByDocument(document);
    correctInternalLinks(figRef);
    invokeGraphic(figRef);
}

// display a Graphic from the navigation
function displayGraphicsNav(figureURL, figureElementId) {
    var figDoc; // XML DOM object of the figure's document
    var figRef;  // XML DOM object of the specific figure tag within the document
    var xmlhttp; // xml response object
    
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
    else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.open("GET",figureURL,false);
    xmlhttp.send();
    figDoc = document.createElement('div');
    figDoc.innerHTML = xmlhttp.responseText;
    setGlobalsFromMeta(xmlhttp.responseText);
    addChangebarsByDocument(figDoc);
    addTableChangebarsByDocument(figDoc);
    var figElements = figDoc.getElementsByTagName('div');
    for (var i=0; i < figElements.length; i++) {
        if (figElements[i].getAttribute('id') == figureElementId) {
            figRef = figElements[i];
            break;
        }
    }
    if (figRef == null) {
        alert("Figure reference " + figureElementId + " at " +
              figureURL + " not found.");
    }
    else {
        correctInternalLinks(figRef);
        invokeGraphic(figRef);
    }
}

// invokeGraphic creates a displayed graphic window given a figure reference object
function invokeGraphic(figRef) {
    // Check if there is an online disclaimer to load. If there is one available,
    // load it as the official disclaimer, otherwise, just use the default.
    var xmlhttp;
    var inHTML;
/*    if (!haveGraphicDisclaimer) {
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
        else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.open("GET",graphicDisclaimerPath,false);
        xmlhttp.send();
        if (xmlhttp.status == 200) {
           graphicDisclaimer = xmlhttp.responseText;
        }
       
        haveGraphicDisclaimer = true;
    }
    */    
    inHTML = countSheets(figRef.innerHTML);
    if (metaChapter == "frontmatter") {
        docTitle = "";
    }
    else {
        docTitle = metaChapter + '-' + metaSection + '-' + metaSubject + ' ' + metaPbTitle;
    }
    
    winRef = window.open("","_blank",
                         "scrollbars=yes, status=no, toolbar=no, location=no, resizable=1, menubar=1, width=1100, height=900");
    winRef.document.writeln('<HTML><STYLE = "text/css">body {font-family:Verdana;} </STYLE>');
    winRef.document.writeln('<SCRIPT type="text/javascript">');
    winRef.document.writeln('function tableStyleDisplay(styleTo) {');
    winRef.document.writeln('var allDivs = document.getElementsByTagName("div");');
    winRef.document.writeln('for (var i = 0; i < allDivs.length; i++) {');
    winRef.document.writeln(' if (allDivs[i].className.indexOf("key") >= 0) {');
    winRef.document.writeln(' allDivs[i].style.display = styleTo;} } }');
    winRef.document.writeln('</SCRIPT>');
//    winRef.document.write('<link href="css/styler.css" rel="stylesheet" type="text/css"></link>');
//    winRef.document.write('<script type="text/javascript" src="pwcdisplay.js"></script>');
    winRef.document.writeln('<title>' + docTitle + '</title>');
    winRef.document.writeln('<BODY><CENTER>');
    winRef.document.writeln('<div style="font-size: 24pt; font-weight: bold;">PRATT &amp; WHITNEY CANADA</div><br/>');
    winRef.document.writeln('<div style="font-size: 18pt; font-weight: bold;">' + manType(metaManualType) + '</div>' );
    winRef.document.write('<div style="font-size: 14pt; font-weight: bold;">MANUAL PART NO. ' + metaManualServiceBulletinNo + 
                          ' REVISION NO. ' + metaRevNo.toString());
    winRef.document.write(metaPointRev.toString() == "0" ? "" : ('.' + metaPointRev.toString()));
    winRef.document.writeln( '</div>');
    winRef.document.writeln('<div style="font-size: 14pt; font-weight: bold;">' + docTitle + '</div></CENTER>');
    winRef.document.writeln('<div id="innerFigs">' + inHTML + '</div>');
    winRef.document.writeln('<p style="font-size:9px">Printed on: ' + pwcCurrentDate() + 
                          ' ' + graphicDisclaimer + '</p>');
    winRef.document.writeln('<br/><form action="#"><table><tr><td>');
    winRef.document.writeln('<input id="bPrint" type="button" value="Print" onclick="tableStyleDisplay(\'block\');document.getElementById(\'bClose\').style.display=\'none\'; document.getElementById(\'bPrint\').style.display=\'none\';window.print();document.getElementById(\'bClose\').style.display=\'block\';document.getElementById(\'bPrint\').style.display=\'block\';tableStyleDisplay(\'none\');"/></td>');
    winRef.document.writeln('<td><input id="bClose" type="button" value="Close" onclick="window.close();"/></td></tr></table></form>')
    winRef.document.writeln('</HTML></BODY>');
    
    winRef.document.close();
}


function displayConsumables(consumableElementId) {
    
    var winRef;
    var conRef;
    
    conRef = document.getElementById(consumableElementId);
    
    winRef = window.open("","_blank",
                         "scrollbars=yes, status=no, toolbar=no, location=no, resizable=1, menubar=1, width=600, height=600");
    winRef.document.write('<HTML><STYLE = "text/css">body {font-family:Verdana}</STYLE>');
//    winRef.document.write('<link href="css/styler.css" rel="stylesheet" type="text/css" />');
    winRef.document.write('<BODY><CENTER>');
    winRef.document.write('<div id="consumables">' + conRef.innerHTML + '</div>');
    winRef.document.write('</CENTER></BODY></HTML>');
    winRef.document.close();
}

function displayEffCodes(effTableElementId) {
    
    var winRef;
    var effRef;
    
    effRef = document.getElementById(effTableElementId);
    winRef = window.open("","_blank",
                         "scrollbars=yes, status=no, toolbar=no, location=no, resizable=1, menubar=1, width=400, height=400");
    winRef.document.write('<HTML><STYLE = "text/css">body {font-family:Verdana}</STYLE>');
// LB - not needed right now, perhaps in the future...
//    winRef.document.write('<link href="css/styler.css" rel="stylesheet" type="text/css" />');
    winRef.document.write('<BODY><CENTER>');
    winRef.document.write('<div id="eff">' + effRef.innerHTML + '</div>');
    winRef.document.write('</CENTER></BODY></HTML>');
    winRef.document.close();
}

function clobberUnlinkableAnchors() {
    var aElements = document.getElementsByTagName("a");
    var sbPat = new RegExp("s(b|pb)Link");
    for (var aNum = 0; aNum < aElements.length; aNum++) {
        var aEle = aElements[aNum];
        var aEleParent = aEle.parentNode;
        var aEleParentParent = aEleParent.parentNode;
        if (aEleParent.className == " x--sfe-CrossReference-1-0" && 
            (aEleParentParent.className == " x-refint-2-0" || 
             aEleParentParent.className == " x-xref-5-0")) {
            aEle.removeAttribute("href");
        
        }
        // if running in Offline mode, remove the link to any sbLinks or spbLinks
        // also need to clobber the class of the parent element, since it is set to blue underline
        // which implies a link.
        if (document.location.href.search("localhost") >= 0) {
            if (typeof aEle.onclick != "undefined") {
                var evOnClick = String(aEle.onclick);
                if (evOnClick.search(sbPat) >= 0) {
                    aEle.onclick = null;
                    aEleParent.removeAttribute("className");
                    aEle.removeAttribute("href");
               }
            }
        }
    }
}

//Add change bars to table rows 
function addTableChangebarsByDocument(doc){
    var rows = doc.getElementsByTagName("tr");
                
    for(var tr = 0; tr < rows.length; tr++){
        var row = rows[tr];
        var entries = row.getElementsByTagName("td");
        for(var td = 0; td < entries.length; td++)
        {
            var entry = entries[td];
            var divs = entry.getElementsByTagName("div");
            for(var div = 0; div < divs.length; div++)
            {
                var rev = divs[div];
                if(rev.className.indexOf("revst") >= 0)
                {
                    entry.style.backgroundColor = revisionColor;
                }
            }
        }
                                
        if (row.className.indexOf("x-row-1-1") >= 0) {
            var rowHeight = 0;
            rowHeight = row.offsetHeight;
            var cells = row.getElementsByTagName("td");
            
            for (var i=0; i < cells.length; i++) {
                cells[i].style.backgroundColor = revisionColor;
            }
            
/*            var cbDiv = doc.createElement("div");
            
            if(cells.length > 0){
                var cell1 = cells[0];
                cell1.style.cssFloat="clear";
                cbDiv.className = "changebar";
                cbDiv.style.borderLeft = "3px solid black"; 
                cbDiv.style.display = "block";
                cbDiv.style.position = "relative";
                pcbDiv.style.zIndex = "-10"; 
                cbDiv.style.cssFloat = "left";
                cbDiv.style.styleFloat = "left";
                cbDiv.style.padding = "0px"; 
                cbDiv.style.height = rowHeight + "px"; 
                cbDiv.style.margin = "-6px 0px -" + rowHeight + "px -16px";
                cbDiv.innerHTML = "&nbsp;";
                cell1.insertBefore(cbDiv, cell1.firstChild);

            }
*/        }
    }
    clobberUnlinkableAnchors();
} 

function addTableChangebars() {
    addTableChangebarsByDocument(document);
}

//Add change bars for standard elements
function addChangebarsByDocument(doc){
    
    var divs = doc.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
        if (divs[i].className == "changebar") {
            return;
        }
    }
    
            for(var i=0; i < divs.length; i++){
        var div = divs[i];
        var revisionID;
        var revbarHeight = 0;
        
        revisionID = div.getAttribute("name");
        if (div.className.indexOf("x-revst") >= 0) {
            var revbarDiv = div;
            var sibling;
            var siblings = new Array();
            //Floating div that will act as the revbar
            var revbarFloat = document.createElement("div");
            //Initial height of the revbar
            var revbarHeight = 10;
            
            revbarFloat.className = "revbarFloat";
//          revbarFloat.style.borderLeft = "3px solid black"; 
            revbarFloat.style.display = "block";
            revbarFloat.style.position = "relative";
            revbarFloat.style.zIndex = "-10"; 
            revbarFloat.style.cssFloat = "left"; 
            revbarFloat.style.styleFloat = "left";
            revbarFloat.style.padding = "0px";
            revbarFloat.style.marginLeft = "-3px";
            revbarFloat.innerHTML = "&nbsp;";
            
            revbarDiv.className = "changebar";
            revbarDiv.style.cssFloat="clear";
            
            sibling = revbarDiv.nextSibling;
            //Get the top margin of the first sibling so that we know where to start the revbar
                        var topMargin = 0;
                        if (typeof sibling.currentStyle != "undefined") {
                            topMargin = sibling.currentStyle.marginTop;
                        }
//                        var calcHeight = 0;
            var siblingCount = 0;
//                        var calcAlert = "";
            while(sibling.nodeType != null){
                
                if(sibling.className != null){
                    if(sibling.className.indexOf("x-revend") >= 0
                            && sibling.getAttribute("name") == revisionID){
                                        //We've reached the end of this changebar
                        break;
                    } 
                    else if(sibling.className.indexOf("x-graphic") >= 0){
                                            //We need to get the child img's height to calculate the revbar height
/*                                                var cHeight = calcImgHeight(sibling);
                        revbarHeight = revbarHeight + cHeight;
                                                calcAlert = calcAlert + " imgHeight = " + cHeight;
                        topMargin = "0px";
*/                      siblings[siblingCount] = sibling;
                        siblingCount++;
                    }
                    else{
                        siblings[siblingCount] = sibling;
                        siblingCount++;
                    } 
                }
                
                sibling = sibling.nextSibling;
                
            }
            
            //Move the sibling into the changebar div
            for(var h = 0; h < siblings.length; h++){
                            if (siblings[h].nodeType == 1) {
                                siblings[h].style.backgroundColor = revisionColor;
                                if (siblings[h].className.indexOf("x-graphic") >= 0) {
                                    siblings[h].style.borderLeft = "10px solid " + revisionColor;
                                }
                                var descendants = siblings[h].getElementsByTagName('*');
                                for (var j=0; j < descendants.length; j++) {
                                    if (descendants[j].nodeType == 1) {
                                        descendants[j].style.backgroundColor = revisionColor;
                                        if (descendants[j].className.indexOf("x-graphic") >= 0) {
                                            descendants[j].style.borderLeft = "10px solid " + revisionColor;
                                        }
                                    }
                                }
                            }
//              revbarDiv.appendChild(siblings[h]);
                        }
                            
//                        alert("sibling change count = " + sibChangeCount);
            //Calculate the revbar height and add the revbar float with the border
/*                        alert('calc: ' + calcAlert + ' revbarHeight = ' + revbarHeight + 'offsetHeight = ' + revbarDiv.offsetHeight);
            revbarHeight = revbarHeight + revbarDiv.offsetHeight;
            revbarFloat.style.height = revbarHeight + "px"; 
            revbarFloat.style.marginBottom = "-" + (revbarHeight) + "px";
            revbarFloat.style.marginTop = topMargin;
            
            //Add the revbar float to the revbar div
*/                  revbarDiv.insertBefore(revbarFloat, revbarDiv.firstChild);
        }
        
    }
}

function addChangebars() {
    addChangebarsByDocument(document);
}

//Find an image's height
function calcImgHeight(imgDiv){
    var imgHeight = 0;
    var images = new Array();
    images = imgDiv.getElementsByTagName('img');
    for(var i = 0; i < images.length; i++){
        var imgage = images[i];
        
        imgHeight = imgHeight + loadImg(imgage.src);
            }
    return imgHeight;
}

function loadImg(imgPath){
    var myImage = new Image();
    var imgHeight = 0;
    myImage.name = imgPath;
    myImage.src = imgPath;
    
    imgHeight = myImage.height;
    
    return imgHeight;
}



//Expand or collapse tables
function toggle(heading, tableId) {
    var headingObj = document.getElementById(heading);
    var tableObj = document.getElementById(tableId);
    
    if (tableObj) {
        if (tableObj.style.display == "block") {
            tableObj.style.display='none';
            headingObj.style.cursor='s-resize';
        } else {
            tableObj.style.display='block';
            headingObj.style.cursor='n-resize';
        }
    }
    //Change bars won't be displayed until the table is visible
    addTableChangebars();
}

// change the Statement of Authority disclaimer to a specific text
function changeSoaTo(updatedDisclaimer) {
        var allDivs = document.getElementsByTagName("div");
        for (var i=0; i < allDivs.length; i++) {
            if (allDivs[i].getAttribute("title") == "soa") {
                allDivs[i].innerHTML = updatedDisclaimer;
            }
        }
}

// first update the SOA with the default disclaimer, and retrieve the changeable
// one from a static address. If successful, update the SOA with the found disclaimer
function updateSOA() {
/*
  This function will be removed in favor of setting the disclaimer as an entity.
  
    var content;
    var xmlhttp;
    if (!haveSoaDisclaimer) {
        // find the div with a title="soa", and replace it's contents
        // with the response
        changeSoaTo(soaDisclaimer);
        
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
        else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        
        xmlhttp.open("GET",soaDisclaimerPath,false);
        xmlhttp.send();
        if (xmlhttp.status == 200) {
            changeSoaTo(xmlhttp.responseText);
        }
    }
*/
}

// Test for digits
function isDigit(aChar) {
      myCharCode = aChar.charCodeAt(0);
   
      if((myCharCode > 47) && (myCharCode <  58))
      {
         return true;
      }
   
      return false;
}

function getSPBNumberFromContent(inContent)
{
    var re = /.*-(.*) SPB NO. (\d*)/;
    results = inContent.match(re);
    if(results != null)
        return results[1] + "-" + results[2];
    return "";
}

function getSBNumberFromContent(inContent)
{
    var content = "";
    var numberStr = "";
    var startIdx = -1;
    var endIdx = -1;
    var lastCharDigit = false;
    // if the content contains "No. ", then the number is after the No.
    // instead of the first number encountered
    var inPos = inContent.search("NO. ");
    if (inPos > -1) {
        content = inContent.substr(inPos);
    }
    else {
        content = inContent;
    }
    for (var i=0; i < content.length; i++) {
        if (isDigit(content.charAt(i))) {
            return parseInt(content.substr(i));
        }
    }
    return "";
}

function sbLink(linkValue) {
    var startTag = document.getElementsByTagName("body")[0];
    setGlobalsFromMeta(startTag.innerHTML);
    var sbNum = getSBNumberFromContent(linkValue);
    // var linkUrl = sbspbPrefix + "documenttype=tpub_sb&object_name=" +sbNum; // original line
    var linkUrl = sbspbPrefix + "SERVICE_BULLETIN/" + sbNum; // SR170565: modified line
    winRef = window.open(linkUrl,"_blank",
        "scrollbars=yes, status=no, toolbar=no, location=no, resizable=1, menubar=0, width=800, height=400");
}

function spbLink(linkValue) {
    var startTag = document.getElementsByTagName("body")[0];
    setGlobalsFromMeta(startTag.innerHTML);
    var spbNum = getSPBNumberFromContent(linkValue);
    // var linkUrl = sbspbPrefix + "documenttype=tpub_spb&object_name=" +spbNum; // original line
    var linkUrl = sbspbPrefix + "SPARE_PARTS_BULLETIN/" + spbNum; // SR170565: modified line
    winRef = window.open(linkUrl,"_blank",
        "scrollbars=yes, status=no, toolbar=no, location=no, resizable=1, menubar=1, width=800, height=400");
}

//Determines if the width of the columns are too big
function isWidthTooBig(colgroup) {
    var col = colgroup.getElementsByTagName('col');
    for(j = 0; j < col.length; j++) {
        if(col[j].getAttribute('width') !=null && parseInt(col[j].getAttribute('width')) > 1000)
            return true;
    }
    return false;
}
// Reduce width by half
function reduceSize(colgroup) {
    var col = colgroup.getElementsByTagName('col');
    for(j = 0; j < col.length; j++) {
        col[j].setAttribute('width', parseInt(col[j].getAttribute('width'))/2);
    }
}
//Fix tables layout for Google's Chrome browser
window.onload = function() {
    if(window.chrome) {
        var colgroup = document.getElementsByTagName('colgroup');
        for(i = 0; i < colgroup.length; i++) {
            while(isWidthTooBig(colgroup[i])) {
                reduceSize(colgroup[i]);
            }
        }
    }
}

// Functions added

function toggle (headingId, tableId) { 
  var headingObj = document.getElementById(headingId);
  var tableObj = document.getElementById(tableId);
  if (tableObj) {
    if (tableObj.style.display == 'block') {
      tableObj.style.display='none';
    } else {
      tableObj.style.display='block';
    }
  }
}

function go(targetId) {
    var targetObj = document.getElementById(targetId);
    if (targetObj.style.display == 'none') {
        targetObj.style.display='block';
    }
    targetObj.scrollIntoView(true);
}

function showTable(tableId) { 
  var tableObj = document.getElementById(tableId);
  if (tableObj) {
    tableObj.style.display='block';
  }
}