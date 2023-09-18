//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let filterCategory = [];
Init_UI();

function Init_UI() {
    renderBookmarks();

    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de Bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de Bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Jérémy Deschamps
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des bookmarks");
    $("#createBookmark").show();
    $("#abort").hide();
    let Bookmarks = await Bookmarks_API.Get();
    eraseContent();
    if (Bookmarks !== null) {
        if(filterCategory.length == 0){
            Bookmarks.forEach(bookmark => {
                $("#content").append(renderBookmark(bookmark));
            });
        }
        else{
            //console.log("je suis ici car il y a des filtres selectionné");
            let bookmarkFiltered = [];

            Bookmarks.forEach((b) => {
                if(filterCategory.includes(b.Categorie))
                {
                    bookmarkFiltered.push(b);
                }
            });
            bookmarkFiltered.forEach(b => {
                $("#content").append(renderBookmark(b));
            });
        }

        let categories = new Set();
        Bookmarks.forEach((b) => categories.add(b.Categorie));
                                                                                                                                                                             
        $("#dropdown-categorie").empty();
        categories.forEach((categorie) => $("#dropdown-categorie").append(`<div class="dropdown-item categorie"><i class="fa-solid fa-check check" id="check_${categorie.replace(/\s+/g, '_')}"></i>${categorie}</div>`));
        $(".check").hide();
        filterCategory.forEach((categorieSelected) => {
            //console.log(categorieSelected);
            var i = $("#check_" + categorieSelected.replace(/\s+/g, '_'));
            i.show();
        });

        restoreContentScrollPosition();
        
        
        //event listener 
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });

        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        //reload pages if click on filter
        $(".categorie").on("click", function () {
            if(!filterCategory.includes($(this).text()))
            {
                filterCategory.push($(this).text());
            }
            else{
                filterCategory = filterCategory.filter((c) => c !== $(this).text());
            }
            renderBookmarks();
        });

    } else {
        renderError("Service introuvable");
    }

    
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let Bookmark = await Bookmarks_API.Get(id);
    if (Bookmark !== null)
        renderBookmarkForm(Bookmark);
    else
        renderError("Bookmark introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let Bookmark = await Bookmarks_API.Get(id);
    eraseContent();
    if (Bookmark !== null) {
        $("#content").append(`
        <div class="BookmarkdeleteForm">
            <h4>Effacer le Bookmark suivant?</h4>
            <br>
            <div class="BookmarkRow" Bookmark_id=${Bookmark.Id}">
                <div class="BookmarkContainer">
                <div class="BookmarkLayout">
                <span class="BookmarkTitle"><a href="${Bookmark.Title}" target="_blank"><div class="webicon" style="background-image: url(http://www.google.com/s2/favicons?sz=64&domain=${Bookmark.Url})"></div></a> ${Bookmark.Titre}</span>
                <span class="BookmarkCategorie">${Bookmark.Categorie}</span>
            </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await Bookmarks_API.Delete(Bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Bookmark introuvable!");
    }
}
function newBookmark() {
    Bookmark = {};
    Bookmark.Id = 0;
    Bookmark.Titre = "";
    Bookmark.Url = "";
    Bookmark.Categorie = "";
    return Bookmark;
}
function renderBookmarkForm(Bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = Bookmark == null;
    if (create) Bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="BookmarkForm">
        <div class="grand webicon" id="bookmarkImagePreview" style="background-image: url(bookmark-logo.png)"></div></br>            
            <input type="hidden" name="Id" value="${Bookmark.Id}"/>

            <label for="Name" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Titre" 
                id="Name" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${Bookmark.Titre}"
            />
            <label for="Phone" class="form-label">Url </label>
            <input
                class="form-control Url"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer une Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${Bookmark.Url}" 
            />
            <label for="Email" class="form-label">Catégorie </label>
            <input 
                class="form-control Categorie"
                name="Categorie"
                id="Categorie"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${Bookmark.Categorie.replace(/\s+/g, '_')}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#BookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let Bookmark = getFormData($("#BookmarkForm"));
        Bookmark.Id = parseInt(Bookmark.Id);
        showWaitingGif();
        let result = await Bookmarks_API.Save(Bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
    if(!create)
    {
        $('#bookmarkImagePreview').css('background-image', "url(" + `http://www.google.com/s2/favicons?sz=64&domain=${$("#Url").val()}`+ ")");
    }
   
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(Bookmark) {
    return $(`
     <div class="BookmarkRow" Bookmark_id=${Bookmark.Id}">
        <div class="BookmarkContainer noselect">
            <div class="BookmarkLayout">
                <span class="BookmarkTitle"><a href="${Bookmark.Title}" target="_blank"><div class="webicon" style="background-image: url(http://www.google.com/s2/favicons?sz=64&domain=${Bookmark.Url})"></div></a> ${Bookmark.Titre}</span>
                <span class="BookmarkCategorie">${Bookmark.Categorie}</span>
            </div>
            <div class="BookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${Bookmark.Id}" title="Modifier ${Bookmark.Titre}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${Bookmark.Id}" title="Effacer ${Bookmark.Titre}"></span>
            </div>
        </div>
    </div>           
    `);
}