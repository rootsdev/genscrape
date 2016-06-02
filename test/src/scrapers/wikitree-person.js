var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../');

describe.skip('wikitree person', function(){

    it('basic male', function(done) {
        var url = 'http://www.wikitree.com/wiki/Roosevelt-18',
            filePath = path.join(__dirname, '..', 'responses', 'wikitree', 'Theodore Roosevelt Jr.html');
        helpers.mockDom(url, filePath, function () {
            genscrape().on('data', function (data) {
                expect(data).to.deep.equal({
                    givenName: 'Theodore',
                    familyName: 'Roosevelt',
                    birthDate: '1858-Oct-27',
                    birthPlace: 'New York City, New York, USA',
                    deathDate: '1919-Jan-06',
                    deathPlace: 'Oyster Bay, Long Island, New York, USA',
                    fatherGivenName: 'Theodore',
                    fatherFamilyName: 'Roosevelt',
                    motherGivenName: 'Martha',
                    motherFamilyName: 'Bulloch',
                    marriageDate: '1880-Oct-27',
                    marriagePlace: 'Brookline, Massachusetts',
                    spouseGivenName: 'Alice',
                    spouseFamilyName: 'Lee'
                });
                done();
            });
        });
    });

    it('basic female', function(done){
        var url = 'http://www.wikitree.com/wiki/Lee-16',
            filePath = path.join(__dirname, '..', 'responses', 'wikitree', 'Alice Roosevelt.html');
        helpers.mockDom(url, filePath, function () {
            genscrape().on('data', function(data){
                expect(data).to.deep.equal({
                    givenName: 'Alice',
                    familyName: 'Lee',
                    birthDate: '1861-Jul-29',
                    birthPlace: 'Boston, Suffolk, Massachusetts, United States',
                    deathDate: '1884-Feb-14',
                    deathPlace: 'New York City, New York, United States',
                    fatherGivenName: 'George',
                    fatherFamilyName: 'Lee',
                    motherGivenName: 'Caroline',
                    motherFamilyName: 'Haskell',
                    marriageDate: '1880-Oct-27',
                    marriagePlace: 'Brookline, Massachusetts',
                    spouseGivenName: 'Theodore',
                    spouseFamilyName: 'Roosevelt'
                });
                done();
            });
        });
    });

    it('basic nickname', function(done){
        var url = 'http://www.wikitree.com/wiki/Smith-9130',
            filePath = path.join(__dirname, '..', 'responses', 'wikitree', 'Edward M Salty Smith.html');
        helpers.mockDom(url, filePath, function () {
            genscrape().on('data', function(data){
                expect(data).to.deep.equal({
                    givenName: 'Edward M. (Salty)',
                    familyName: 'Smith',
                    birthDate: '1920-Jan-16',
                    deathDate: '1966-Nov-09',
                    fatherGivenName: 'Ed',
                    fatherFamilyName: 'Smith',
                    motherGivenName: 'Hannah',
                    motherFamilyName: 'Margot'
                });
                done();
            });
        });
    });

    it('Much missing information and year of birth', function(done){
        var url = 'http://www.wikitree.com/wiki/Smith-19124',
            filePath = path.join(__dirname, '..', 'responses', 'wikitree', 'Edward Smith.html');
        helpers.mockDom(url, filePath, function () {
            genscrape().on('data', function(data){
                expect(data).to.deep.equal({
                    givenName: 'Edward',
                    familyName: 'Smith',
                    birthDate: '1847--',
                    birthPlace: 'Calstone, Wiltshire, England',
                    spouseGivenName: 'Sarah',
                    spouseFamilyName: 'Rivers'
                });
                done();
            });
        });
    });
});
