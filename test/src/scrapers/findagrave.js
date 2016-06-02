var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../');
    
describe.skip('findagrave', function(){
  
  it('simple', function(done){
    var url = 'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=27336072',
        filePath = path.join(__dirname, '..', 'responses', 'findagrave', '27336072.html');
    helpers.mockDom(url, filePath, function(){
      genscrape()
      .on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Paul',
          familyName: 'Clark',
          birthDate: 'Dec. 16,  1948',
          deathDate: 'Jul. 23,  2000' 
        });
        done();
      })
    });
  })
  
});