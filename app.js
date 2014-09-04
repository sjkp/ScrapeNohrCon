var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');


console.log('Hello world');

function getPage(url, cb) {    
    request.get(url, function (err, req, body) {       
        var $ = cheerio.load(body);
        
        $('#news > li').each(function (i, o) {
            var obj = $(o);
            cb({ 'date': $('.date', obj).text(), 'url': $('a', obj).attr('href'), 'title': $('h2 > a', obj).text() });
        });        
    });
}

function getPages(cb) {
    request.get('http://www.nohr-con.com/dk/news_dk/offentliggjorte_ordretildelinger_fra_ted,offset.0', function (err, req, body) {
        var $ = cheerio.load(body);
        $('#pages > li > a').each(function (i, o) {
            cb($(o).attr('href'));
        });
    });
}

function getDownloadUrl(url, cb) {
    request.get(url, function (err, req, body) {
        $ = cheerio.load(body);
        if ($('.link') != null && $('.link').length > 0) {
            cb('http://www.nohr-con.com/' + $('.link').attr('href'));
        }
        else {
            cb(url);
        }
    });
}

function downloadFile(url, data, cb) {
    var ext = path.extname(url);
    if (ext == '') {    
        ext = '.html';
    }
    console.log(url);
    var filename = (data.date + ' - ' + data.title + ext).replace(/\//g,'-');
    
    console.log(filename);
    request.get(url).pipe(fs.createWriteStream(filename));
    cb();
}




//getDownloadUrl('http://www.nohr-con.com/dk/news_dk/offentliggjorte_ordretildelinger/offentliggjorte_ordretildelinger_d_217_-_277_2010', 
//function (url) { 
//    downloadFile(url, { 'title': 'test', 'date': '12-01-2014' });
//});

var i = 0;

getPages(function (pageUrl) {
    getPage(pageUrl, function (data) {
        getDownloadUrl(data.url, function (fileUrl) {
            downloadFile(fileUrl, data, function () { 
                console.log(i++);
            });            
        });
    });    
});

