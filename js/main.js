const discordHome = "https://discord.com/channels/@me";
const modal = document.getElementById("extWarning");
const extensionID = "edfpalahildnikdjdnmmoekoncglnblh";
var modalCloseButton = document.getElementById("modalClose");
var installedExtVersion;

function version_is_newer(current, available) {
    let current_subvs = current.split(".");
    let available_subvs = available.split(".");
    for (let i = 0; i < 4; i++) {
        let ver_diff = (parseInt(available_subvs[i]) || 0) - (parseInt(current_subvs[i]) || 0);
        if (ver_diff > 0)
            return true;
        else if (ver_diff < 0)
            return false;
    }
    return false;
}

window.addEventListener('DOMContentLoaded', (event) => {
    var extNotLoaded;
    fetch("chrome-extension://" + extensionID + "/discord.webmanifest")
        .then(response => response.json())
        .then(data => {
            installedExtVersion = data.version;
            extNotLoaded = setTimeout(() => {
                document.getElementById('frame').src += ''
            }, 1000);
        })
        .catch((error) => modal.classList.add('show'))

    window.addEventListener('message', function (e) {
        switch (e.data.dest) {
        case 'PWA':
            switch (e.data.type) {
            case 'init':
                clearTimeout(extNotLoaded);
                break;
            case 'badge':
                navigator.setAppBadge(e.data.payload);
                break;
            case 'refresh':
                setTimeout(() => document.getElementById('frame').src += '', 1000);
                break;
            case 'discordLoaded':
                fetch('https://raw.githubusercontent.com/NeverDecaf/discord-PWA/master/updates.xml')
                    .then(response => response.text())
                    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                    .then(data => {
                        if (version_is_newer(installedExtVersion, data.getElementsByTagName("updatecheck")[0].getAttribute('version'))) {
                            e.source.postMessage({
                                dest: 'iframe',
                                type: 'updateAvailable'
                            }, e.origin);
                        }
                    }).catch(err => {
                        console.log('Error checking for extension updates.');
                    })
                break;
            case 'clientcss':
                fetch('./css/client.css').then(resp => resp.text().then(txt => {
                    e.source.postMessage({
                        dest: 'background',
                        type: 'clientcss',
                        payload: txt
                    }, e.origin);
                }));
                break;
            case 'customTitle':
                document.title = e.data.payload;
                break;
            }
            break;
        }
    });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./discord-pwa-sw.js');
    }
});

window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.remove('show');
    }
}
modalCloseButton.onclick = function () {
    modal.classList.remove('show');
}
