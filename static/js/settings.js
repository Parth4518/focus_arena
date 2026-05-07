function softAccent(hex){
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);

    return `rgba(${r}, ${g}, ${b}, 0.14)`;
}

fetch("/me")
.then(r => r.json())
.then(user => {
    if(user.accent){
        document.documentElement.style.setProperty(
            "--accent",
            user.accent
        );

        document.documentElement.style.setProperty(
            "--accent-soft",
            softAccent(user.accent)
        );
    }
});

function setAccent(color){

    document.documentElement.style.setProperty(
        "--accent",
        color
    );

    document.documentElement.style.setProperty(
        "--accent-soft",
        softAccent(color)
    );

    fetch("/save_theme",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            accent:color
        })
    });
}

function logoutUser(){
    window.location.href = "/logout";
}