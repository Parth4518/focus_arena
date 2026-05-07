fetch("/leaderboard")
.then(r => r.json())
.then(data => {

    fetch("/me")
    .then(r => r.json())
    .then(user => {

        if(user.accent){
            document.documentElement.style.setProperty(
                "--accent",
                user.accent
            );
        }

        const board = document.getElementById("board");

        const html = data.map((u, i) => {

            const avatar = u.avatar
                ? `<img class="avatar" src="${u.avatar}">`
                : `<div class="avatar"></div>`;

            return `
                <div class="rank-item">
                    ${avatar}
                    <strong>#${i + 1}</strong>
                    <span>${u.name}</span>
                    <span style="margin-left:auto">${u.score}</span>
                </div>
            `;
        }).join("");

        board.innerHTML = html;

    });

});