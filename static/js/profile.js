fetch("/profile_data")
.then(r => r.json())
.then(data => {

    if(data.avatar){
        document.getElementById("profileAvatar").src =
            data.avatar;
    }

    document.getElementById("profileInfo").innerHTML = `
        <h2>${data.username}</h2>
        <br>
        Total sessions: ${data.total_sessions}<br>
        Best score: ${data.best_score}<br>
        Average score: ${data.average_score}<br>
        Streak: ${data.streak}
    `;

    fetch("/me")
    .then(r=>r.json())
    .then(user=>{
        if(user.accent){
            document.documentElement.style.setProperty(
                "--accent",
                user.accent
            );
        }
    });
});

function uploadAvatar(){
    const file =
        document.getElementById("avatarInput").files[0];

    if(!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    fetch("/upload_avatar",{
        method:"POST",
        body:formData
    })
    .then(r=>r.json())
    .then(d=>{
        if(d.avatar){
            document.getElementById("profileAvatar").src =
                d.avatar;
        }
    });
}
function softAccent(hex){
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);

    return `rgba(${r}, ${g}, ${b}, 0.14)`;
}