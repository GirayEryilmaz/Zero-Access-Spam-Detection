

const mailClassifier = require('../mailClassifier');
const expect = require('chai').expect;

describe('mailClassifier.spamProbabilities() tests', () => {
    describe('mailClassifier.cosineSimilarity() Test', () => {
        it('All are the same so are spam with prob 1', () => {
            const result = mailClassifier.spamProbabilities(['a a', 'a a ', 'a a ', ' a a']);
            expect(result).to.eql([1,1,1,1]);
        });
        it('All are different so are ham', () => {
            const result = mailClassifier.spamProbabilities(['b b ', 'a']);
            expect(result).to.eql([0, 0]);
        });
        it('First one is different. The two should have the same probs', () => {
            const result = mailClassifier.spamProbabilities(['b b b', 'a a a a', 'a a a c c c c ']);
            const check = result[1] === result[2] && result[0] === 0;
            expect(check).to.be.true;
        });
        it('First set is less similar, prob should be lower for the same item.', () => {
            const result1 = mailClassifier.spamProbabilities(['b b a a', 'a a a a', 'a a a b c']);
            const result2 = mailClassifier.spamProbabilities(['b a a a', 'a a a a', 'a a a a b']);
            const check = result1[1] < result2[1];
            expect(check).to.be.true;
        });
        it('Should throw an error demanding an array', () => {
            expect(mailClassifier.spamProbabilities.bind(mailClassifier,{})).to.throw(("mails should be an array and should contain text bodies. Found object"));
        });
    });
});