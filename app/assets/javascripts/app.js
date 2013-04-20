var _apikey = 'somethingwitty';
var _contacts = null;
var _contactID = null;
var _baseurl = 'contacts/';
var _appendurl = '';
var _nextID = 1;

function getContacts(cb) {
  $.getJSON(
    _baseurl + _appendurl,
    function(data) {
      _contacts = data;
      cb();
    }
  );
}

function getContact(id, cb) {
  $.getJSON(
    _baseurl + id + _appendurl,
    function(data) {
      cb(data);
    }
  );
}

function ensureIsArray(obj) {
  if (obj === undefined) {
    return Array();
  } else if (!$.isArray(obj)) {
    return Array(obj);
  } else {
    return obj;
  }
}

function idToValue(prefix, id) {
  if (id !== undefined) {
    return $("#"+prefix+"_"+id).val();
  } else {
    return "";
  }
}

$(document).on("click", "#contact_delete_btn", function() {
  $.ajax({
    url: _baseurl + _contactID + _appendurl,
    type: 'DELETE',
    success: function(result) {
      console.log("contact deleted..");
      goHome();
    }
  });
});

$.fn.serializeObject = function()
{
  var jsonObject = {};
  var elements = this.serializeArray();
  $.each(elements, function() {
    if (jsonObject[this.name] !== undefined) {
      if (!jsonObject[this.name].push) {
        jsonObject[this.name] = [jsonObject[this.name]];
      }
      jsonObject[this.name].push(this.value || '');
    } else {
      jsonObject[this.name] = this.value || '';
    }
  });
  return jsonObject;
};

$(document).on("click", "#contact-list a", function() {
  _contactID = $(this).data('contact-id');
  console.log("_contactID : " + _contactID);
});

$(document).on("click", "#save", function() {
  var frmDetails = $('form').serializeObject();

  frmDetails.emails = ensureIsArray(frmDetails.emails);
  frmDetails.phones = ensureIsArray(frmDetails.phones);

  frmDetails.default_txt_phone = idToValue("phone", frmDetails.default_txt_phone);
  frmDetails.default_call_phone = idToValue("phone", frmDetails.default_call_phone);
  frmDetails.default_email = idToValue("email", frmDetails.default_email);

  $.ajax({
    type: $('form').attr('method'),
    url: _baseurl + frmDetails.id + _appendurl,
    dataType: "json",
    data: JSON.stringify(frmDetails),
    contentType: "application/json",
    success: function(result) {
      console.log("contact saved..");
      goBack();
    }
  });

  return false;
});

$(document).on("pagebeforeshow", "#home-page", function() {
  var contactList = $("#contact-list");
  contactList.html('');
  _contactID = null;
  getContacts(function() {
    //console.log("_contact : " + _contacts);
    for (var i in _contacts ) { 
      var contact = _contacts[i];
      //console.log("contact : " + contact.name);
      if (contact.default_email === undefined) {
        contact.default_email = "";
      }
      contactList.append(
      '<li>'+
      '<a href="#contact-details-page" data-contact-id="'+contact.id+'">'+
      '<img src=http://www.gravatar.com/avatar/'+ md5(contact.default_email) +'?d=monsterid />'+
      '<h2>'+contact.name+'</h2>'+
      '<p>'+contact.title+'</p>'+
      '</a>'+
      '</li>');
    }
    contactList.listview('refresh');
  });
});

function goBack() {
  var nextPage = "#home-page"
  if (_contactID != null) {
    nextPage = "#contact-details-page"
  }
  $.mobile.changePage( nextPage, {
    transition: "slide",
    reverse: false,
    changeHash: true
  });
}

function goHome() {
  $.mobile.changePage( "#home-page", {
    transition: "slide",
    reverse: false,
    changeHash: true
  });
}

$(function() {
  $( "#contact-details-page" ).on( 'swiperight', swiperightHandler );
});

function swiperightHandler( event ) {
  goHome();
}

$(document).on("pagebeforeshow", "#contact-details-page", function() {
  var contactContent = $("#contact-details-content");
  contactContent.html('');
  getContact(_contactID, function(contact) {
    var detailsPage = $("#contact-details-page");
    if (contact.default_email === undefined) {
      contact.default_email = "";
    }
    detailsPage.find("#detail_name").text(contact.name);
    detailsPage.find("#detail_title").text(contact.title);
    var parent = $("#detail_emails");
    parent.empty();
    for (email in contact.emails) {
      var newElement = $("<p>" + contact.emails[email] + "</p>");
      if (contact.emails[email] == contact.default_email) {
        newElement.append($("<b> (default)</b>"));
      }
      parent.append(newElement);
    }
    parent = $("#detail_phones");
    parent.empty();
    for (phone in contact.phones) {
      var newElement = $("<p>" + contact.phones[phone] + "</p>");
      if (contact.phones[phone] == contact.default_call_phone) {
        if (contact.phones[phone] == contact.default_txt_phone) {
          newElement.append($("<b> (default call/text)</b>"));
        } else {
          newElement.append($("<b> (default call)</b>"));
        }
      }
      else if (contact.phones[phone] == contact.default_txt_phone) {
        newElement.append($("<b> (default text)</b>"));
      }
      parent.append(newElement);
    }
    detailsPage.find("#detail_twitter").text(contact.twitterId);
    detailsPage.find("#detail_image").html("<img src=http://www.gravatar.com/avatar/"+ md5(contact.default_email) +"?d=monsterid />");
  });
});

function updateContactPage(contact) {
  // First, update the form method and page title.
  if (contact.id == "") {
    $('form').attr('method', 'post');
    $('#contact-edit-page div[data-role="header"] h1').html("New Contact");
  } else {
    $('form').attr('method', 'put');
    $('#contact-edit-page div[data-role="header"] h1').html("Edit Contact");
  }

  // Then update all the form elements
  $("#id").val(contact.id);
  $("#name").val(contact.name);
  $("#title").val(contact.title);
  $('#phones').empty();
  for (phone in contact.phones) {
    defaultCall = false;
    defaultText = false;
    if (contact.phones[phone] == contact.default_call_phone) {
      defaultCall = true;
    }
    if (contact.phones[phone] == contact.default_txt_phone) {
      defaultText = true;
    }
    addPhoneNum(contact.phones[phone], defaultCall, defaultText, false);
  }
  $('#emails').empty();
  for (email in contact.emails) {
    defaultEmail = false;
    if (contact.emails[email] == contact.default_email) {
      defaultEmail = true;
    }
    addEmail(contact.emails[email], defaultEmail, false);
  }
}

$(document).on("pagebeforeshow", "#contact-edit-page", function() {
  if (_contactID != null) {
    getContact(_contactID, updateContactPage);
  } else {
    updateContactPage({
      id:"",
      name:"",
      title:"",
      default_email:"",
      default_call_phone:"",
      default_txt_phone:"",
      emails:[],
      phones:[]
    });
  }
});

/* Ensures at least one radiobox is selected, if there are any on the   */
/* page.                                                                */
function ensureDefaultSelected(name) {
  var currSelected = $("input[name=" + name + "]:checked");
  if (currSelected.size() == 0) {
    currSelected = $("input[name=" + name + "]:first");
    if (currSelected.size() != 0) {
      currSelected.attr("checked", true).checkboxradio("refresh");
    }
  }
}

/* Called when a user tries to delete an e-mail / phone number from the */
/* list.                                                                */

function onDeleteList(event) {
  $(event.target).parentsUntil("div[data-role='fieldcontain']").remove();
  ensureDefaultSelected("default_email");
  ensureDefaultSelected("default_call_phone");
  ensureDefaultSelected("default_txt_phone");
  return false;
}

/* Add a new e-mail address to the form.                                */

function addEmail(email, defaultEmail, checkDefault) {
  if (defaultEmail) {
    extraTxt = " checked=checked";
  } else {
    extraTxt = "";
  }
  var newElement = $(
    '<div data-role="fieldcontain" class="ui-hide-label">' +
    '  <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">' +
    '    <table width="100%" cellspacing="0" cellpadding="0">' +
    '      <tr>' +
    '        <td>' +
    '          <input type="radio" name="default_email" id="default_email_' + _nextID + '" value="' + _nextID + '"' + extraTxt + ' />' +
    '          <label for="default_email_' + _nextID + '">Default Email</label>' +
    '        </td>' +
    '        <td width="100%">' +
    '          <input type="text" name="emails" id="email_' + _nextID + '" value="' + email + '" placeholder="Email" data-inline="true" />' +
    '          <label for="email_' + _nextID + '">Email</label>' +
    '        </td>' +
    '        <td>' +
    '          <a href="" data-role="button" data-icon="delete" class="ui-btn-right delete-btn" data-inline="true" onclick="return onDeleteList(event);"></a>' +
    '        </td>' +
    '      </tr>' +
    '    </table>' +
    '  </fieldset>' +
    '</div>'
  );
  $('#emails').append(newElement);
  newElement.trigger('create');

  $('div[data-role="fieldcontain"] fieldset  div div label[for^="default_email"] span span').html('<img src="/assets/email.png" width="32px" height="32px"></img>');
  if (checkDefault) {
    ensureDefaultSelected("default_email");
  }
  _nextID++;
}

/* Add a new phone number to the form.                                  */

function addPhoneNum(phone, defaultCall, defaultText, checkDefault) {
  if (defaultCall) {
    chkCall = " checked=checked";
  } else {
    chkCall = "";
  }

  if (defaultText) {
    chkTxt = " checked=checked";
  } else {
    chkTxt = "";
  }

  var newElement = $(
    '<div data-role="fieldcontain" class="ui-hide-label">' +
    '  <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">' +
    '    <table width="100%" cellspacing="0" cellpadding="0">' +
    '      <tr>' +
    '        <td>' +
    '          <input type="radio" name="default_txt_phone" id="default_txt_phone_' + _nextID + '" value="' + _nextID + '"' + chkTxt + ' />' +
    '          <label for="default_txt_phone_' + _nextID + '">Default Text Number</label>' +
    '        </td>' +
    '        <td>' +
    '          <input type="radio" name="default_call_phone" id="default_call_phone_' + _nextID + '" value="' + _nextID + '"' + chkCall + ' />' +
    '          <label for="default_call_phone_' + _nextID + '">Default Call Number</label>' +
    '        </td>' +
    '        <td width="100%">' +
    '          <input type="text" name="phones" id="phone_' + _nextID + '" value="' + phone + '" placeholder="Phone Number" data-inline="true" />' +
    '          <label for="phone_' + _nextID + '">Phone Number</label>' +
    '        </td>' +
    '        <td>' +
    '          <a href="" data-role="button" data-icon="delete" class="ui-btn-right delete-btn" data-inline="true" onclick="return onDeleteList(event);"></a>' +
    '        </td>' +
    '      </tr>' +
    '    </table>' +
    '  </fieldset>' +
    '</div>'
  );

  // Let jQuery re-style the elements appropriately.
  $('#phones').append(newElement);
  newElement.trigger('create');

  // Restyle the default text/phone to more descriptive images
  $('div[data-role="fieldcontain"] fieldset  div div label[for^="default_txt_phone"] span span').html('<img src="/assets/texting.png" width="32px" height="32px"></img>');
  $('div[data-role="fieldcontain"] fieldset  div div label[for^="default_call_phone"] span span').html('<img src="/assets/phone.png" width="32px" height="32px"></img>');

  // Ensure a default is selected for both phone and text
  if (checkDefault) {
    ensureDefaultSelected("default_call_phone");
    ensureDefaultSelected("default_txt_phone");
  }

  // Increment the ID
  _nextID++;
}