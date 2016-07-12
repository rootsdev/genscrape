var nock = require('nock'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:tests:findmypast-tree'),
    pagesDir = __dirname + '/../../data/findmypast-tree/pages',
    outputDir = __dirname + '/../../data/findmypast-tree/output';

describe.only('findmypast tree', function(){
  
  it('process data', function(done){
    
    nockSetup('863a418d-78de-43e6-9af6-c9ce320a86ef', '1079720865');
    nockSetup('863a418d-78de-43e6-9af6-c9ce320a86ef', '1079720864');
      
    helpers.mockWindow('http://tree.findmypast.co.uk/#/trees/863a418d-78de-43e6-9af6-c9ce320a86ef/1079720865/profile', function(){
      
      var dataEvents = 0,
          noDataEvents = 0,
          error;
        
      genscrape()
      .on('noData', function(){
        debug('noData');
        noDataEvents++;
        
        if(noDataEvents === 1){
          window.location.hash = '#/trees/863a418d-78de-43e6-9af6-c9ce320a86ef/1079720864/media';
        }
      })
      .on('data', function(data){
        debug('data');
        dataEvents++;
        
        if(dataEvents === 1){
          expect(noDataEvents).to.equal(0);
          error = helpers.compareOrRecordOutput(data, outputDir + '/1079720865.json');
          window.location.hash = '#/trees/863a418d-78de-43e6-9af6-c9ce320a86ef/all-hints';
        }
        
        else if(dataEvents === 2){
          expect(noDataEvents).to.equal(1);
          error = helpers.compareOrRecordOutput(data, outputDir + '/1079720864.json');
          done(error);
        }
        
        else {
          expect(true).to.be.false;
        }

      })
      .on('error', done);
    });
  });
  
  it('should work on fmp.com domain', function(done){
    helpers.mockWindow('http://tree.findmypast.com/', function(){
      genscrape()
      .on('noMatch', function(){
        throw new Error('No URL match');
      })
      .on('noData', function(){
        done();
      });
    });
  });
  
  it('should work on fmp.ie domain', function(done){
    helpers.mockWindow('http://tree.findmypast.ie/', function(){
      genscrape()
      .on('noMatch', function(){
        throw new Error('No URL match');
      })
      .on('noData', function(){
        done();
      });
    });
  });
  
  it('should work on fmp.com.au domain', function(done){
    helpers.mockWindow('http://tree.findmypast.com.au/', function(){
      genscrape()
      .on('noMatch', function(){
        throw new Error('No URL match');
      })
      .on('noData', function(){
        done();
      });
    });
  });
  
});

/**
 * Configure nock to respond properly to requests
 * for the given person with test data
 */
function nockSetup(treeId, personId){
  nock('http://tree.findmypast.co.uk', {
      'Family-Tree-Ref': treeId
    })
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/api/proxy/get?url=api%2Ffamilytree%2Fgetfamilytree%3Ffamilytreeview%3DProfileRelations%26personId%3D'+personId)
    .replyWithFile(200, pagesDir + '/' + personId + '.json');
}