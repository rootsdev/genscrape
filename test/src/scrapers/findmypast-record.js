var setupTest = require('../../testHelpers').createTestRunner('findmypast-record');
    
describe.only('findmypast-record', function(){

  it('1911 England Census - Head', setupTest(
    '1911-england-census-head',
    'http://search.findmypast.com/record?id=gbc%2f1911%2frg14%2f24584%2f0135%2f1'
  ));
  
  it('1911 England Census - Daughter', setupTest(
    '1911-england-census-daughter',
    'http://search.findmypast.com/record?id=gbc%2f1911%2frg14%2f24584%2f0135%2f3'
  ));
  
  it('1841 England Census', setupTest(
    '1841-england-census',
    'http://search.findmypast.com/record?id=gbc%2f1841%2f0005244738'
  ));
  
  it('1900 US Census', setupTest(
    '1900-us-census',
    'http://search.findmypast.com/record?id=usc%2f1900%2f004114960%2f00265%2f084'
  ));
  
  it('England, Birth and Baptisms', setupTest(
    'england-births-baptisms',
    'http://search.findmypast.com/record?id=r_931803621'
  ));
  
  it('England and Wales Deaths', setupTest(
    'england-deaths',
    'http://search.findmypast.com/record?id=bmd%2fd%2f1896%2f4%2faz%2f000376%2f022'
  ));
  
  it('England and Wales Marriages', setupTest(
    'england-marriages',
    'http://search.findmypast.com/record?id=bmd%2fm%2f1878%2f4%2faz%2f000312%2f104'
  ));
  
  it('US Marriages Male', setupTest(
    'us-marriages-male',
    'http://search.findmypast.com/record?id=us%2ffs%2fm%2f001084854%2f1'
  ));
  
  it('US Marriages Divorced Female', setupTest(
    'us-marriages-divorced',
    'http://search.findmypast.com/record?id=us%2ffs%2fm%2f010363877%2f2'
  ));
  
  it('Denbigh Banns', setupTest(
    'denbigh-banns',
    'http://search.findmypast.com/record?id=gbprs%2fm%2f881019255%2f1'
  ));
  
  it('Denbigh Baptisms', setupTest(
    'denbigh-baptisms',
    'http://search.findmypast.com/record?id=gbprs%2fb%2f879273212%2f1'
  ));
  
  it('Denbigh Burials', setupTest(
    'denbigh-burials',
    'http://search.findmypast.com/record?id=gbprs%2fd%2f878322398%2f1'
  ));
  
  it('Denbigh Marriages', setupTest(
    'denbigh-marriages',
    'http://search.findmypast.com/record?id=gbprs%2fm%2f880081323%2f1'
  ));
  
  it('Passenger Lists leaving UK', setupTest(
    'leaving-uk',
    'http://search.findmypast.com/record?id=tna%2fbt27%2f0980000042%2f00187'
  ));
  
  it('New York Passenger Lists & Arrivals', setupTest(
    'ny-arrivals',
    'http://search.findmypast.com/record?id=us%2fpass%2fny%2fei%2f16551289'
  ));
  
});