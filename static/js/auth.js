function signup(){
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(r => r.json())
    .then(d => {
        document.getElementById("msg").innerText = d.message;
    });
}

function login(){
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(r => r.json())
    .then(d => {
        document.getElementById("msg").innerText = d.message;

        if(d.message === "Login successful"){
            window.location.href = "/dashboard";
        }
    });
}