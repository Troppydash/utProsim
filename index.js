// URL DATA
const URLS = {
    LIST: 'https://miniature-acoustics-production.up.railway.app/api/listFiles?user=utprosim',
    GET: 'https://miniature-acoustics-production.up.railway.app/api/getFile?user=utprosim',
    UPLOAD: 'https://miniature-acoustics-production.up.railway.app/api/newFile'
}


async function UploadFile({name, file}) {
    // replace all spaces with underscores
    name = name.replace(/\s/g, '_');

    if (!name.endsWith('.pdf')) {
        name += '.pdf';
    }

    let formData = new FormData();
    formData.append('file', file.files[0]);
    formData.append('name', name);
    formData.append('user', 'utprosim');
    formData.append('password', [ 112, 97, 115, 115, 99, 111, 100, 101 ].map(i => String.fromCharCode(i)).join(''));

    const response = await fetch(URLS.UPLOAD, {
        method: 'POST',
        body: formData
    });

    return await response.json();
}

async function RetrieveList() {
    try {
        const data = await fetch(URLS.LIST);
        return (await data.json()).files;
    } catch (e) {
        throw new Error(`RetrieveList failed with ${e.toString()}`);
    }
}

function SearchSiv() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('SearchInput');
    filter = input.value;
    ul = document.getElementById("Links");
    li = ul.getElementsByTagName('li');

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
} // Clearing those not searched for


/**
 * When thing loaded up
 * @returns
 */
async function Start() {
    const displayedList = document.getElementById('Links');
    // const linkData = ['https://docs.google.com/document/d/e/2PACX-1vSyoNl-4_uPcDtzPh2BFKibeE2yatJUtSHzgKcf69yq-HBGYtGKgtWOpwmc2Hki7ur6OReHchdvGHXZ/pub'];
    // Need to get array link data from server

    const content = await RetrieveList();
    // const content = [];
    // clear loading item
    displayedList.innerHTML = '';
    for (const item of content) {
        const {name, mimeType, size, modifiedTime} = item;

        const a = document.createElement('a');
        a.addEventListener('click', ((link) => (e) => {
            e.preventDefault();
            window.open(link, '_blank');
        })(`${URLS.GET}&name=${name}`));
        a.href = `${URLS.GET}&name=${name}`;

        let safename = name;
        if ( name.lastIndexOf('.') !== -1) {
            safename = name.slice(0, name.lastIndexOf('.'));
        }
        // replace all _ with spaces
        safename = safename.replace(/_/g, ' ');
        a.innerText = safename;

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const date = new Date(modifiedTime);
        const metadata = document.createElement('span');
        metadata.innerText = `${mimeType} | ${(size / 1024 / 1024).toFixed(2)}MB | ${monthNames[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
        a.appendChild(metadata);

        const newItem = document.createElement("li");
        newItem.appendChild(a);
        displayedList.appendChild(newItem);
    }
}


function arrayEqual(a1, a2) {
    if (a1.length !== a2.length)
        return false;

    for (let i = 0; i < a1.length; ++i) {
        if (a1[i] !== a2[i])
            return false;
    }
    return true;
}

async function AddTitle(event) {
    event.preventDefault();

    const status = document.getElementById('Upload');
    const Passcode = document.getElementById('PasscodeInput');
    const articleName = document.getElementById('TitleInput');
    const articleLink = document.getElementById('FileInput');

    // check if password is correct
    if (!arrayEqual(Passcode.value.split('').map(c => c.charCodeAt(0) + 10), [119, 107, 113, 115, 109])) {
        status.textContent = "Passcode is Incorrect";
        return;
    }


    // verify all attributes
    if (!articleName.value) {
        status.textContent = "Please input a title for your article";
        return;
    }

    if (!articleLink.value) {
        status.textContent = "Please input a link for your article";
        return;
    }

    // Upload file
    status.textContent = '';

    const {error, success} = await UploadFile({
        name: articleName.value,
        file: articleLink
    });
    if (!success) {
        status.textContent = `Server error: ${error}`;
        return;
    }

    // clear inputs
    Passcode.value = '';
    articleLink.value = null;
    articleName.value = '';

    alert("Article uploaded successfully, refreshing in 5 seconds");
    setTimeout(() => {
        window.location.reload();
    }, 5000);
}


document.addEventListener("DOMContentLoaded", async () => {
    // do the bindings
    const form = document.getElementById('uploadForm');
    form.addEventListener('submit', AddTitle);

    await Start();
})

//        async function getListOfFiles() {
//            // /api/listFiles
//            const root = "https://miniature-acoustics-production.up.railway.app";
//            const response = await fetch("https://miniature-acoustics-production.up.railway.app/api/listFiles");
//            console.log(response);
//            return await response.json();
//
//            document.getElementById("ui").textContent = root.open(getFile, wp.png, true);
//
//        }
//
// This was my attempt at reading the server


// TODO: Fix special characters
// and fix deleting files, add admin page
