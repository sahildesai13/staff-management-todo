var express = require('express');
var bodyParser = require('body-parser')
var mysql = require('mysql');

var app = express();

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node"
})

app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');

app.get('/userLogin', function (req, res) {
    res.render('empLogin');
});

app.post('/userLogin', (req, res) => {
    let { useremail, password } = req.body;
    let sql = "SELECT * FROM emp WHERE useremail='" + useremail + "' AND password='" + password + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("data = ", result);
        if (result.length > 0) {
            res.render('empDashboard', { data: result[0] });
        } else {
            res.redirect('/userLogin')
        }
    });
})



app.get('/empRegister', function (req, res) {
    res.render('empSignup');
});

app.post('/empRegister', function (req, res) {
    let { username, useremail, password } = req.body;
    let sql = "INSERT INTO emp (username,useremail,password) VALUES ('" + username + "','" + useremail + "','" + password + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.redirect('/adminDashboard')
    });
});

app.get('/', function (req, res) {
    res.render('admin');
});

app.get('/adminDashboard', function (req, res) {
    res.render('adminDashboard');
});

app.post('/', (req, res) => {
    let { adminemail, password } = req.body;
    let sql = "SELECT * FROM admin WHERE adminemail='" + adminemail + "' AND password='" + password + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
            res.redirect('/adminDashboard')
        } else {
            res.redirect('/')
        }
    });
})

app.get('/addtask', (req, res) => {
    let sql = "SELECT * FROM emp";
    con.query(sql, function (err, result) {
        console.log(result[0]);
        if (err) throw err;
        res.render('addTask', { employee: result });
    })
})


app.get('/showEmp',(req,res)=>{
    let sql = "SELECT * FROM emp";
    con.query(sql, function (err, result) {
        console.log(result);
        if (err) throw err;
        res.render('showEmp', { data: result });
    }) 
}) 


app.post('/addtask', (req, res) => {
    let { taskname, employee, startdate, enddate } = req.body;

    console.log(employee);
    let sql = "INSERT INTO task (taskname,employee,startdate,enddate) VALUES ('" + taskname + "','" + employee + "','" + startdate + "','" + enddate + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.redirect('/adminDashboard');
        console.log(result);
    })
})


app.get('/showtask', (req, res) => {
    let sql = "SELECT * FROM task";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.render('showTask', { data: result, formatDate: formatDate });
    })
})

app.get('/mytask/:id', (req, res) => {
    let id = req.params.id;
    let sql = "SELECT * FROM task WHERE employee=?";
    con.query(sql, [id], function (err, result) {
        console.log(result);
        if (err) throw err;
        if (result.length > 0) {
            res.render('empTask', { data: result, formatDate: formatDate });
        } else {
            res.redirect('/userLogin');
        }
    });
});

app.get('/deleteTask/:id', (req, res) => {
    var id = req.params.id;
    var query = 'DELETE FROM task WHERE id = ' + id;
    con.query(query, (err, result) => {
        if (err) throw err;
        res.redirect('/showtask');
    });
})



app.get('/updateTask/:id', (req, res) => {
    var id = req.params.id;
    let sql = "SELECT * FROM emp";
    var query = 'SELECT * FROM task WHERE id = ' + id;
    con.query(sql, (err1, ressult1) => {
        if (err1) throw err1;
        con.query(query, (err, result) => {
            if (err) throw err;
            res.render('updateTask', { data: result[0], employee: ressult1, formatDate: formatDate });
        });
    })
})

app.post('/updateTask/:id', (req, res) => {

    let { taskname, employee, startdate, enddate } = req.body;
    var id = req.params.id;
    let sql = "UPDATE task SET taskname = '" + taskname + "', employee = '" + employee + "', startdate = '" + startdate + "', enddate = '" + enddate + "' WHERE id = " + id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.redirect('/showtask');
    })
})


app.get('/approved/:id', (req, res) => {
    var id = req.params.id;
    var query = 'update task set IsApproved = 1 where id = ' + id;
    var sql = "SELECT * FROM task where id="+id;
    con.query(query, (err, result) => {
        if (err) throw err;
        con.query(sql, (err1, result1) => {
            if (err1) throw err1;
            res.redirect('/mytask/'+result1[0].employee);
        });
    });
})

app.get('/decline/:id', (req, res) => {
    var id = req.params.id;
    var query = 'update task set IsApproved = 0 where id = ' + id;
    var sql = "SELECT * FROM task where id="+id;
    con.query(query, (err, result) => {
        if (err) throw err;
        con.query(sql, (err1, result1) => {
            if (err1) throw err1;
            res.redirect('/mytask/'+result1[0].employee);
        });
    });
})

app.get('/complete/:id', (req, res) => {
    var id = req.params.id;
    var query = 'update task set status = 1 where id = ' + id;
    var sql = "SELECT * FROM task where id="+id;
    con.query(query, (err, result) => {
        if (err) throw err;
        con.query(sql, (err1, result1) => {
            if (err1) throw err1;
            res.redirect('/mytask/'+result1[0].employee);
        });
    });
})
app.get('/pending/:id', (req, res) => {
    var id = req.params.id;
    var query = 'update task set status = 0 where id = ' + id;
    var sql = "SELECT * FROM task where id="+id;
    con.query(query, (err, result) => {
        if (err) throw err;
        con.query(sql, (err1, result1) => {
            if (err1) throw err1;
            res.redirect('/mytask/'+result1[0].employee);
        });
    });
})

function formatDate(dateString) {
    var date = new Date(dateString);
    var day = date.getDate().toString().padStart(2, '0');
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var year = date.getFullYear();
    return day + '-' + month + '-' + year;
}
app.listen(3000, () => {
    console.log("server is running on port 3000");
});