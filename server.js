var express = require("express");

var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;
var mysql2 = require("mysql2");


var app = express();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCNo-7nhHtkP9YQGCDKxbYSHWsZEKUa6eQ");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.use(express.static("public"));
app.use(fileuploader());




app.listen(2005, function () {

    console.log("Server started at port 2005")

})




app.use(express.urlencoded(true)); //convert POST data to JSON object
app.use(express.json());


cloudinary.config({
    cloud_name: 'djgjcuz8w',
    api_key: '948365516489269',
    api_secret: 'cLT9urUcUVwwZxUvErWGkT6HFAs' // Click 'View API Keys' above to copy your API secret
});

// -----------------------AIVEN STARTED--------------------------------------------------------------------------------------------

let dbConfig = "mysql://avnadmin:AVNS_hIGtTL7FIcfgnW3GFxp@mysql-33ef5455-praveersingh587-6457.c.aivencloud.com:21142/defaultdb";


let mySqlVen = mysql2.createPool(dbConfig);
console.log("Aiven connected sucessfully");

// mySqlVen.connect(function (errKuch) {

//     if (errKuch == null)
//         console.log("Aiven Connected Successfully");
//     else
//         console.log(errKuch);

// })



app.get("/", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);

    let path = __dirname + "/public/index.html";
    resp.sendFile(path);
})

app.get("/pro_signup", function (req, resp) {
    //resp.send("Sigup page");
    let path = __dirname + "/public/pro_signup.html";
    resp.sendFile(path);

})


app.post("/server-signup-safe", function (req, resp) {

    console.log("BODY:", req.body);

    let name = req.body.txtName;
    let emailid = req.body.txtEmail;
    let pwd = req.body.txtPassword;
    let usertype = req.body.txtUser;

    mySqlVen.query("insert into SignupData values(?,?,?,?,1)", [name, emailid, pwd, usertype], function (errKuch) {

        if (errKuch == null)
            resp.send("record saved successfully");
        else
            resp.send("Error" + errKuch.message)
    })
})

app.get("/server-login", function (req, resp) {

    let emailid = req.query.txtEmail2;

    let pwd = req.query.txtPassword2;





    mySqlVen.query("select * from SignupData where emailid=? ", [emailid], function (err, allRecords) {



        if (allRecords.length == 0)
            resp.send("NoData");
        else {
            let userstatus = allRecords[0].status;

            let userpwd = allRecords[0].pwd;


            if (userstatus == 0)
                resp.send("Blocked");
            else if (pwd != userpwd)
                resp.send("WrongPwd");

            else
                resp.send(allRecords[0].usertype);

        }



    })

})

app.post("/fill-orgDeatil", async function (req, resp) {

    let picurl = "";
    if (req.files != null) {
        let fileName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fileName;
        req.files.profilePic.mv(fullPath);



        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {

            picurl = picUrlResult.url;  //will give u the url of ur pic on cloudinary server 

            console.log(picurl);

        });
    }
    else
        picurl = "nopic.jpg";

    let emailid = req.body.txtEmailOrg;
    let orgName = req.body.txtorgName;
    let regNo = req.body.txtregNo;
    let city = req.body.txtcity;
    let address = req.body.txtAddress;
    let sports = req.body.txtSports;
    let website = req.body.txtWebsite;
    let insta = req.body.txtInstagram;
    let orgHead = req.body.txtOrgHead;
    let contact = req.body.txtContact;
    let other = req.body.txtOther;

    mySqlVen.query("insert into OrgDetails value(?,?,?,?,?,?,?,?,?,?,?,?)", [emailid, orgName, regNo, city, address, sports, website, insta, orgHead, contact, picurl, other], function (errKuch) {



        if (errKuch == null)
            resp.send("record saved successfully");
        else
            console.log(errKuch.message)

    })


})


app.get("/get-one", function (req, resp) {
    mySqlVen.query("select * from OrgDetails where emailid=?", [req.query.txtEmail], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    })
})

app.get("/publish-event", function (req, resp) {


    let emailid = req.query.txtEmail;
    let event = req.query.txtEvent;
    let toe = req.query.txtToe;
    let time = req.query.txtTime;
    let address = req.query.txtAddress;
    let sports = req.query.txtSports;
    let minAge = req.query.txtMinAge;
    let maxAge = req.query.txtMaxAge;
    let lastDate = req.query.txtLastDate;
    let fee = req.query.txtFee;
    let contact = req.query.txtContact;
    let prize = req.query.txtPrize;
    let city = req.query.txtCity;


    mySqlVen.query("insert into eventData values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [null, emailid, event, toe, time, address, sports, minAge, maxAge, city, lastDate, fee, contact, prize], function (errKuch) {

        if (errKuch == null)
            resp.send("record saved successfully");
        else
            console.log(errKuch.message)


    })


})

app.get("/do-fetch-all-users", function (req, resp) {
    console.log(req.query);
    let emailid = req.query.txtEmail;

    mySqlVen.query("select * from eventData where emailid=?", [emailid], function (err, allRecords) {

        resp.send(allRecords);


    })
})


app.get("/delete-one", function (req, resp) {
    console.log(req.query)
    let rid = req.query.rid;


    mySqlVen.query("delete from eventData where rid=?", [rid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(" Deleted Successfulllyyyy...");

        }
        else
            resp.send(errKuch);

    })
})




async function RajeshBansalKaChirag(imgurl) {
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    // console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    // console.log(jsonData);

    return jsonData

}

app.post("/picreader", async function (req, resp) {
    let jsonData1 = [];
    let fileName;
    if (req.files != null) {
        //const myprompt = "Read the text on picture and tell all the information";
        //  const myprompt = "Read the text on picture in JSON format";
        fileName = req.files.AdhaarPic.name;
        let locationToSave = __dirname + "/public/uploads/" + fileName;//full ile path

        req.files.AdhaarPic.mv(locationToSave);//saving file in uploads folder

        //saving ur file/pic on cloudinary server
        try {
            await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {

                let jsonData = await RajeshBansalKaChirag(picUrlResult.url);


                // resp.send(jsonData);
                console.log(jsonData)
                jsonData1 = jsonData;
            });



        }
        catch (err) {
            resp.send(err.message)
        }

    }


    let profilepicurl = "";
    let acpicurl = "";

    if (req.files != null) {
        let fileName1 = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fileName1;
        req.files.profilePic.mv(fullPath);



        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {

            profilepicurl = picUrlResult.url;  //will give u the url of ur pic on cloudinary server 

            console.log(profilepicurl);

        });
    }
    else
        profilepicurl = "nopic.jpg";



    if (req.files != null) {
        let fileName2 = req.files.AdhaarPic.name;
        let fullPath = __dirname + "/public/uploads/" + fileName2;
        req.files.AdhaarPic.mv(fullPath);



        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {

            acpicurl = picUrlResult.url;  //will give u the url of ur pic on cloudinary server 

            console.log(acpicurl);

        });
    }
    else
        acpicurl = "nopic.jpg";


    let emailid = req.body.txtEmail;
    let Name = jsonData1.name;
    let dob = jsonData1.dob;
    let gender = jsonData1.gender;
    let address = req.body.txtAddress;
    let contact = req.body.txtContact;
    let game = req.body.txtSports;
    let other = req.body.txtOther;

    mySqlVen.query("insert into players value(?,?,?,?,?,?,?,?,?,?)", [emailid, acpicurl, profilepicurl, Name, dob, gender, address, contact, game, other], function (errKuch) {



        if (errKuch == null)
            resp.send("record saved successfully");
        else
            console.log(errKuch.message)

    })

})


app.get("/fetch-users-all", function (req, resp) {


    mySqlVen.query("select * from SignupData", [], function (err, allRecords) {

        resp.send(allRecords);


    })
})


app.get("/block-user", function (req, resp) {
    console.log(req.query)
    let emailid = req.query.emailid;


    mySqlVen.query("update SignupData set status=0 where emailid=?;", [emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(" Blocked Successfulllyyyy...");

        }
        else
            resp.send(errKuch);

    })
})

app.get("/unblock-user", function (req, resp) {
    console.log(req.query)
    let emailid = req.query.emailid;


    mySqlVen.query("update SignupData set status=1 where emailid=?;", [emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(" UnBlocked Successfulllyyyy...");

        }
        else
            resp.send(errKuch);

    })
})


app.get("/fetch-tournaments", function (req, resp) {

    // alert();
    // console.log(req.query);
    mySqlVen.query("select * from eventData where city=? and sports=? ", [req.query.city, req.query.game], function (err, allRecords) {

        // console.log(allRecords);
        resp.send(allRecords);


    })
})



app.get("/fetch-player-details", function (req, resp) {
    mySqlVen.query("select * from players where emailid=?", [req.query.txtEmail], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    })
})


app.get("/fetch-organisers", function (req, resp) {


    mySqlVen.query("select * from SignupData where usertype='organiser' ", [], function (err, allRecords) {

        resp.send(allRecords);


    })
})

app.get("/fetch-players", function (req, resp) {


    mySqlVen.query("select * from SignupData where usertype='player' ", [], function (err, allRecords) {

        resp.send(allRecords);


    })
})


app.post("/update-organiser", async function (req, resp) {
    let picurl = "";
    if (req.files != null) //user wants to Update Profile Pic
    {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = req.body.hdn;


    let emailid = req.body.txtEmailOrg;
    let orgName = req.body.txtorgName;
    let regNo = req.body.txtregNo;
    let city = req.body.txtcity;
    let address = req.body.txtAddress;
    let sports = req.body.txtSports;
    let website = req.body.txtWebsite;
    let insta = req.body.txtInstagram;
    let orgHead = req.body.txtOrgHead;
    let contact = req.body.txtContact;
    let other = req.body.txtOther;

    mySqlVen.query("update OrgDetails set orgName=?,regNo=?,city=?,address=?,sports=?,website=?,insta=?,orgHead=?,contact=?,picurl=?,other=? where emailid=?", [orgName, regNo, city, address, sports, website, insta, orgHead, contact, picurl, other, emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Record Updated Successfulllyyy....Badhai");
            else
                resp.send("Inavlid email Id");
        }
        else
            resp.send(errKuch.message)
    })

})


app.get("/player-setting", function (req, resp) {
    console.log(req.query)
    let emailid = req.query.txtEmail;
    let oldpwd = req.query.txtOldPwd;
    let newpwd = req.query.txtNewPwd;

    mySqlVen.query("update  SignupData set pwd=? where emailid=? and pwd=?", [newpwd, emailid, oldpwd], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Password changed Succesfully");
            else
                resp.send("Invalid Email id or Password");
        }
        else
            resp.send(errKuch);

    })
})


app.get("/do-fetch-all-cities", function (req, resp) {
    mySqlVen.query("select distinct city from eventData", function (err, allRecords) {
        resp.send(allRecords);
    })
})

