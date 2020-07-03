/**
 * @summary Zero access spam detection
 * @author Giray Eryılmaz
 * 
 */
const table = {
    /**
     * A 2D table to hold cosine similarities between pairs
     * Since the matrix is bound to be simmetrical, it is possible use only one half. But we don't do it 
     * 
     */
    rows : Array(),

    init: function(size){
        for(var i = 0; i<size; i++){
            this.rows.push(Array(size));
        }

    },

    reset: function(){
        this.rows = Array();
    },

    set: function(i,j,value){
        if(i==j){
            this.rows[j][i] = 0;
        }else {
            /* Since the table is symmetrical */
            this.rows[i][j] = value;
            this.rows[j][i] = value;
        }


    }

}


function preprocess(text){
    /**
     * Basic preprocessing of an email body text
     * Removes punctiations, trims, turns all letters to lowercase then splits from spaces.
     * Of course could be more advanced if needed
     * 
     */
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim().toLowerCase().split(/\s+/g);

}


function calculateDFsTFs(mails){
    /**
     * Goes through the corpora and counts term frequencies and document frequencies.
     * @param mails An array of emails text bodies
     */

    const DFs = {};

    var TFs; 

    var numberOfMails = mails.length;

    TFs = mails.map(function(mail){

        var tokens = preprocess(mail);

        var TF = {};
        tokens.forEach(function(token){
            if(token in TF){
                TF[token]++;
            }else{
                TF[token]=1;
            }
        });

        Object.keys(TF).forEach(function(token){
            if(token in DFs){
                DFs[token]++;

            }else{
                DFs[token]=1;
            }
        });


        return TF;
    });


    return{
        "DFs":DFs,
        "TFs":TFs
    }

}

function cosineSimilarity(vector1, vector2){
    /**
     * @param vector1 A dictionary (object in fact) of token : number pairs
     * @param vector2 Another dictionary (object in fact) of token : number pairs
     * @returns Cosine similarity between given vectors
     */
    const keys1 = Object.keys(vector1);
    
    var total = 0;
    keys1.forEach(function(key){
        if(key in vector2){
            total += vector1[key] * vector2[key]
        }
    });

    var length1 = Math.hypot(...(Object.values(vector1)));

    var length2 = Math.hypot(...(Object.values(vector2)));

    const result = total / length1 / length2; 

    return result;

}

function fillTable(mails, DFs, TFs){
    /**
     * Fills the table with cosine similarties between every pair of emails
     * @param mails the list of mails,  essentially it is not necessarily needed here but anyways
     * @param DFs Document frequecies of every word in the corpora as a dictionary (object)
     * @param TFs Term frequecies of every email as an array of dictionaries (objects), the order TF's must be the same as that of mails
     */

    table.init(mails.length);

    for(var i = 0; i < mails.length ; i++){
        for(var j = 0; j <= i ; j++){

            const vector1 = {};
            Object.keys(TFs[i]).forEach(function(key){
                
                vector1[key] = TFs[i][key] / DFs[key]; // if vocab may grow, then must guard against division by zero; can omit in this case

            });

            const vector2 = {};
            Object.keys(TFs[j]).forEach(function(key){
                
                vector2[key] = TFs[j][key] / DFs[key]; // if vocab may grow, then must guard against division by zero; can omit in this case

            });

            const value = cosineSimilarity(vector1, vector2);
            table.set(i, j, value);
        }
    }


}

function spamProbabilities(mails){
    /**
     * @param mails An array of mails body texts
     * @returns Average cosine similarity of every email to every other email which is a number between 0 and 1
     * and can be interpretted as the probabilities for respective emails to be spam
     */

    if (!Array.isArray(mails)) {
        throw ("mails should be an array and should contain text bodies. Found " + typeof mails);
    }else if(mails.length<2){
        throw ("There should be at least 2 mails in the array called mails.");
    }

    table.reset();
    const DFsTFs = calculateDFsTFs(mails);
    DFs = DFsTFs.DFs;
    TFs = DFsTFs.TFs;

    fillTable(mails, DFs, TFs);

    const avgs = table.rows.map(row => row.reduce((a,b) => a+b, 0)/(row.length-1));

    return avgs;

}



module.exports.spamProbabilities = spamProbabilities;







