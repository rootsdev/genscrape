var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));

describe.only('findmypast ancestor', function(){
  
  it('process data', function(done){
    
    nockSetup('1079720865');
      
    helpers.mockWindow('http://tree.findmypast.co.uk/#/trees/863a418d-78de-43e6-9af6-c9ce320a86ef/1079720865/profile', function(){
      
      var dataEvents = 0,
          noDataEvents = 0;
        
      genscrape()
      .on('noData', function(){
        
      })
      .on('data', function(data){
        expect(data.givenName).to.equal('Albert John');
        expect(data.familyName).to.equal('Zierak');
        done();
      })
    });
  })
  
})

/**
 * Configure nock to respond properly to requests
 * for the given person with test data
 */
function nockSetup(personId){
  nock('http://tree.findmypast.co.uk')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/api/proxy/get?url=api%2Ffamilytree%2Fgetfamilytree%3Ffamilytreeview%3DProfileRelations%26personId%3D'+personId)
    .replyWithFile(200, path.join(__dirname, '..', 'responses', 'findmypast', 'tree', personId+'.json'));
}