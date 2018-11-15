//express server
const express = require('express');
const server = express();
const fs = require('fs');
const path = require('path');

const html2pdf = require("html2pdf-node");
//obtain bundle
const bundle =  require('./dist/server.bundle.js');
//get renderer from vue server renderer
const renderer = require('vue-server-renderer').createRenderer({
    //set template
    template: fs.readFileSync('./index.html', 'utf-8')
});

server.use('/dist', express.static(path.join(__dirname, './dist')));

//start server
server.get('*', (req, res) => {

    bundle.default({ url: req.url }).then((app) => {
        //context to use as data source
        //in the template for interpolation
        const context = {
            title: 'Vue JS - Server Render',
            meta: `
                <meta description="1vuejs server side render"></meta>
            `
        };

        renderer.renderToString(app, context, function (err, html) {
            if (err) {
              if (err.code === 404) {
                res.status(404).end('Page not found')
              } else {
                res.status(500).end('Internal Server Error')
              }
            } else {

              console.log('html',html);
              html2pdf.generatePdfOfHtml( html.toString())
                .then(pdfFilePath=>{
                  console.log('pdfFilePath',pdfFilePath)

                  res.end(html)
                })
                .catch(err=>{
                  console.log('err',err)
                  res.end(err)
                });



            }
          });
    }, (err) => {
        console.log(err);
    });
});

server.listen(8080);
