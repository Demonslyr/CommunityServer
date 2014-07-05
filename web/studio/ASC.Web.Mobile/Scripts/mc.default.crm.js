/*
(c) Copyright Ascensio System SIA 2010-2014

This program is a free software product.
You can redistribute it and/or modify it under the terms 
of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of 
any third-party rights.

This program is distributed WITHOUT ANY WARRANTY; without even the implied warranty 
of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see 
the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html

You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.

The  interactive user interfaces in modified source and object code versions of the Program must 
display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 
Pursuant to Section 7(b) of the License you must retain the original Product logo when 
distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under 
trademark law for use of our trademarks.
 
All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
*/

;window.DefaultMobile = (function(DefaultMobile) {
    if (!DefaultMobile) {
        console.log('Default.crm: has no DefaultMobile');
        return DefaultMobile;
    }
    var lastFilterValue = '', lastSearchValue = '';
    
    function getContactNoteData($page) {
        var data = {
            contactid: $page.find('input.note-contactid:first').removeClass('error-field').val(),
            title: $page.find('input.note-title:first').removeClass('error-field').val() || '',
            content: $page.find('textarea.note-description:first').removeClass('error-field').val() || ''
        };
        for (var fld in data) {
            if (data.hasOwnProperty(fld)) {
                data[fld] = TeamlabMobile.verificationValue(data[fld]);
            }
        }
        var errors = [];
        for (var fld in data) {
            if (data.hasOwnProperty(fld)) {
                if (data[fld] !== null) {
                    continue;
                }
                switch (fld) {
                    case 'contactid': errors.push($page.find('input.note-contactid:first').addClass('error-field')); break;
                    case 'content': errors.push($page.find('textarea.note-description:first').addClass('error-field')); break;
                    case 'title': errors.push($page.find('input.note-title:first').addClass('error-field')); break;
                }
            }
        }
        if (errors.length === 0) {
            return data;
        }
        ASC.Controls.messages.show(Base64.encode(ASC.Resources.ErrEmpyField), 'error', ASC.Resources.ErrEmpyField);
        return null;
    }
    
    DefaultMobile.reset_search_crm_contacts = function(evt, $page, $this) {
        lastSearchValue = '';
        TeamlabMobile.getCrmContactsBySearchValue(null);
    };
    DefaultMobile.search_crm_contacts = function(evt) {
        var $form = $(evt.target), searchvalue = '';
        searchvalue = $form.length > 0 ? $form.find('input.top-search-field:first').val() : searchvalue;
        if (typeof searchvalue !== 'string' || (searchvalue = (searchvalue.replace(/^\s+|\s+$/g, '')).toLowerCase()) === lastSearchValue) {
            return undefined;
        }
        lastSearchValue = searchvalue;
        TeamlabMobile.getCrmContactsBySearchValue(searchvalue);
    };
    DefaultMobile.filter_crm_contacts = function(evt) {
        var $page = null, item = null, $items = null, itemsInd = 0, value = '', filtervalue = evt.target.value;
        if (typeof filtervalue !== 'string' || (filtervalue = (filtervalue.replace(/^\s+|\s+$/g, '')).toLowerCase()) === lastFilterValue) {
            return undefined;
        }
        lastFilterValue = filtervalue;
        $page = $('div.ui-page-active:first');
        if (filtervalue) {
            $page.find('form.search-form:first').addClass('active');
        } else {
            $page.find('form.search-form:first').removeClass('active');
        }
        //todo        
        $items = $page.find('li.item.person');
        itemsInd = $items.length;
        while (itemsInd--) {
            item = $items[itemsInd];
            value = item.getAttribute('data-itemname');
            if (!value) {
                continue;
            }
            if (value.toLowerCase().indexOf(filtervalue) === -1) {
                $(item).addClass('uncorrect-item');
            } else {
                hasCorrect = true;
                $(item).removeClass('uncorrect-item');
            }
        }
    };
    DefaultMobile.search_crm_tasks = function(evt) {
        var $form = $(evt.target), searchvalue = '';
        searchvalue = $form.length > 0 ? $form.find('input.top-search-field:first').val() : searchvalue;
        if (searchvalue) {
            TeamlabMobile.getCrmTasksBySearchValue(searchvalue);
        }
        else {
            return;
        }
    };
    DefaultMobile.load_more_crm_items = function(evt, $page, $button) {
        var getMoreItems = null;
        var params = {};
        if ($button.attr('data-id')) {
            params.id = $button.attr('data-id');
        }
        if ($button.attr('page')) {
            params.page = $button.attr('page');
        }
        if ($page.hasClass('page-crm')) {
            getMoreItems = TeamlabMobile.getMoreCrmItems;
        }
        if ($page.hasClass('page-crm-tasks')) {
            getMoreItems = TeamlabMobile.getMoreCrmTasks;
        }
        if ($page.hasClass('page-crm-contacttasks')) {
            getMoreItems = TeamlabMobile.getMoreCrmContactTasks;
        }
        if ($page.hasClass('page-crm-history')) {
            getMoreItems = TeamlabMobile.getMoreCrmHistoryEvents;
        }
        if ($page.hasClass('page-crm-contactpersones')) {
            getMoreItems = TeamlabMobile.getMoreCrmContactPersones;
        }
        if ($page.hasClass('page-crm-contactfiles')) {
            getMoreItems = TeamlabMobile.getMoreCrmContactFiles;
        }
        if (getMoreItems) {
            $page.addClass('loading-items');
            if (params.id != null) {
                getMoreItems(null, params.id);
            }
            if (params.page != null) {
                getMoreItems(null, params.page);
            }
            if (params.id == null && params.page == null) {
                getMoreItems(null);
            }
        }
    }
    DefaultMobile.add_crm_task = function(evt, $page, $button) {
        if ($page.length === 0) {
            return undefined;
        }
        $button.removeClass("add-crm-task");
        var data = {
            //description   : null,            
            title: null,
            deadline: null,
            responsibleid: null,
            categoryid: -1,
            isnotify: true
        };
        var errors = [];
        if ($('div.ui-page-active').find('input.task-title').val().length <= 0) {
            errors.push($('div.ui-page-active').find('input.task-title').addClass('error-field'));
        }
        else {
            data.title = $('div.ui-page-active').find('input.task-title:first').removeClass('error-field').val();
        }
        if ($('div.ui-page-active').find('select.task-type').attr('value') == -1) {
            errors.push($('div.ui-page-active').find('select.task-type').parent().addClass('error-field'));
        }
        else {
            $('div.ui-page-active').find('select.task-type').parent().removeClass('error-field').attr('value');
            data.categoryid = $('div.ui-page-active').find('select.task-type  option:selected').val();
        }
        if ($('div.ui-page-active').find('textarea.task-description').val().length > 0) {
            data.description = $('div.ui-page-active').find('textarea.task-description').removeClass('error-field').val();
        }
        if ($('div.ui-page-active').find('input.task-duedate').val() == "" || $('div.ui-page-active').find('input.task-duedate').val() == null) {
            errors.push($('div.ui-page-active').find('input.task-duedate').addClass('error-field'));
        }
        else {
            data.deadline = new Date($('div.ui-page-active').find('input.task-duedate:first').removeClass('error-field').scroller('getDate'));
            data.deadline.setMinutes(00);
            data.deadline.setHours(00);
        }
        if ($('div.ui-page-active').find('select.group-responsible  option:selected').val() == -1 || $('div.ui-page-active').find('select.group-responsible  option:selected').val() == null) {
            errors.push($('div.ui-page-active').find('select.group-responsible').parent().addClass('error-field'));
        }
        else {
            $('div.ui-page-active').find('select.group-responsible').parent().removeClass('error-field');
        }
        if ($('div.ui-page-active').find('select.task-responsible  option:selected').val() == -1 || $('div.ui-page-active').find('select.task-responsible  option:selected').val() == null) {
            errors.push($('div.ui-page-active').find('select.task-responsible').addClass('error-field'));
        }
        else {
            data.responsibleid = $('div.ui-page-active').find('select.task-responsible  option:selected').removeClass('error-field').val();
        }
        if ($button.attr('data-id') != '' || $button.attr('data-id') != null || $button.attr('data-id') != undefined) {
            data.contactId = $button.attr('data-id');
        }
        if (errors.length == 0) {
            return Teamlab.addCrmTask(null, data, {
                success: function(params, items) {
                    if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.crmaddtask)) {
                        items = TeamlabMobile.preparationCrmTask(items);
                        if ($button.attr('data-id') != null) {
                            ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + data.contactId + '/tasks' }, '#crm/contact/' + data.contactId + '/tasks');
                        }
                        else {
                            ASC.Controls.AnchorController.lazymove({ back: '#crm/tasks/' + items.timeType }, '#crm/tasks/' + items.timeType);
                        }
                    }
                }
            });
        }
        ASC.Controls.messages.show(Base64.encode(ASC.Resources.ErrEmpyField), 'error', ASC.Resources.ErrEmpyField);
        $button.addClass("add-crm-task");
        return false;
    }
    DefaultMobile.add_crm_company = function(evt, $page, $button) {
        if ($page.length === 0) {
            return undefined;
        }
        var data = {
            companyName: null
        };
        var contact_data = [];
        data.addresses = [];
        var errors = [];
        if ($('div.ui-page-active').find('input.persone-firstname').val().length <= 0) {
            errors.push($('div.ui-page-active').find('input.persone-firstname').addClass('error-field'));
        }
        else {
            data.companyName = $('div.ui-page-active').find('input.persone-firstname').removeClass('error-field').val();
        }
        var phones = $('div.ui-page-active div.fields-container[data = "phone"]').find('div.info');
        for (var i = 0; i < phones.length; i++) {
            $(phones[i]).find('input.contact-phone').removeClass('error-field');
            var phones_i = $(phones[i]).find('input.contact-phone').val();
            if ($(phones[i]).find('input.contact-phone').val().length > 0) {
                if (phones_i.search(/[0-9 -()]+/) == -1) {
                    errors.push($(phones[i]).find('input.contact-phone').addClass('error-field'));
                }
                else {
                    var phone = {};
                    phone.InfoType = 0;
                    phone.Category = $(phones[i]).find('select.phone-type option:selected"').val();
                    phone.Data = $(phones[i]).find('input.contact-phone').val();
                    if (i == 0) {
                        phone.IsPrimary = true;
                    }
                    else {
                        phone.IsPrimary = false;
                    }
                    contact_data.push(phone);
                }
            }
        }
        var emailes = $('div.ui-page-active div.fields-container[data = "email"]').find('div.info');
        for (var i = 0; i < emailes.length; i++) {
            $(emailes[i]).find('input.contact-email').removeClass('error-field');
            var emailes_i = $(emailes[i]).find('input.contact-email').val();
            if (emailes_i.length > 0) {
                if (emailes_i.search(/[\w]+[@][\w]+[.][a-zA-Z]+/) == -1) {
                    errors.push($(emailes[i]).find('input.contact-email').addClass('error-field'));
                }
                else {
                    var email = {};
                    email.InfoType = 1;
                    email.Category = $(emailes[i]).find('select.email-type option:selected"').val();
                    email.Data = $(emailes[i]).find('input.contact-email').val();
                    if (i == 0) {
                        email.IsPrimary = true;
                    }
                    else {
                        email.IsPrimary = false;
                    }
                    contact_data.push(email);
                }
            }
        }
        var addresses = $('div.ui-page-active').find('div.fields-container[data = "address"]').find("div.info");
        for (var i = 0; i < addresses.length; i++) {
            if ($(addresses[i]).find("input.detail").val().length > 0 || $(addresses[i]).find("input.city").val().length > 0 || $(addresses[i]).find("input.state").val().length > 0 || $(addresses[i]).find("input.zipcode").val().length > 0) {
                var address = {};
                address.InfoType = 7;
                address.Category = $(addresses[i]).find('select.address-type option:selected"').val();
                var country = $(addresses[i]).find("input.detail").val();
                var city = $(addresses[i]).find("input.city").val();
                var street = $(addresses[i]).find("input.street").val();
                var state = $(addresses[i]).find("input.state").val();
                var zipcode = $(addresses[i]).find("input.zipcode").val();
                address.data = '{\r\n  \"street\": \"' + street + '\",\r\n  \"city\": \"' + city + '\",\r\n  \"state\": \"' + state + '\",\r\n  \"zip\": \"' + zipcode + '\",\r\n  \"country\": \"' + country + '\"\r\n}';
                if (i == 0) {
                    address.IsPrimary = true;
                }
                else {
                    address.IsPrimary = false;
                }
                contact_data.push(address);
            }
        }
        var sites = $('div.ui-page-active').find('input.contact-site');
        for (var i = 0; i < sites.length; i++) {
            if ($(sites[i]).val().length > 0) {
                var site = {};
                site.InfoType = 2;
                site.Data = $(sites[i]).val();
                if (i == 0) {
                    site.IsPrimary = true;
                }
                else {
                    site.IsPrimary = false;
                }
                contact_data.push(site);
            }
        }
        if (errors.length == 0) {
            $button.removeClass("add-crm-company");
            if ($button.hasClass("edit")) {
                return Teamlab.updateCrmCompany(null, $button.attr("data-id"), data, {
                    success: function(params, items) {
                        var new_data = { items: contact_data };
                        Teamlab.updateCrmContactData(null, items.id, new_data);
                        if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.editcompany)) {
                            TeamlabMobile.onGetContact_(params, items);
                            ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + items.id }, '#crm/contact/' + items.id);
                        }
                    }
                });
            }
            else {
                return Teamlab.addCrmCompany(null, data, {
                    success: function(params, items) {
                        var new_data = { items: contact_data };
                        if (new_data.items.length > 0) Teamlab.addCrmContactData(null, items.id, new_data);
                        if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.addcompany)) {
                            ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + items.id }, '#crm/contact/' + items.id);
                        }
                    }
                });
            }
        }
        ASC.Controls.messages.show(Base64.encode(ASC.Resources.ErrEmpyField), 'error', ASC.Resources.ErrEmpyField);
        return false;
    }
    DefaultMobile.add_crm_persone = function(evt, $page, $button) {
        if ($page.length == 0) {
            return undefined;
        }
        var data = {
            firstName: null,
            lastName: null
        };
        var contact_data = [];
        data.addresses = [];
        var errors = [];
        if ($('div.ui-page-active').find('input.persone-firstname').val().length <= 0) {
            errors.push($('div.ui-page-active').find('input.persone-firstname').addClass('error-field'));
        }
        else {
            data.firstName = $('div.ui-page-active').find('input.persone-firstname').removeClass('error-field').val();
        }
        if ($('div.ui-page-active').find('input.persone-secondname:first').val().length <= 0) {
            errors.push($('div.ui-page-active').find('input.persone-secondname:first').addClass('error-field'));
        }
        else {
            data.lastName = $('div.ui-page-active').find('input.persone-secondname').removeClass('error-field').val();
        }
        if (($button.attr('data-contactid') != null && $button.hasClass("edit")) || ($button.attr('data-id') != null && !$button.hasClass("edit"))) {
            data.companyId = $button.attr('data-contactid') != null ? $button.attr('data-contactid') : $button.attr('data-id');
        }
        if ($('div.ui-page-active').find('input.persone-position').val().length > 0) {
            data.jobTitle = $('div.ui-page-active').find('input.persone-position').removeClass('error-field').val();
        }
        var phones = $('div.ui-page-active div.fields-container[data = "phone"]').find('div.info');
        for (var i = 0; i < phones.length; i++) {
            $(phones[i]).find('input.contact-phone').removeClass('error-field');
            var phones_i = $(phones[i]).find('input.contact-phone').val();
            if ($(phones[i]).find('input.contact-phone').val().length > 0) {
                if (phones_i.search(/[0-9 -()]+/) == -1) {
                    errors.push($(phones[i]).find('input.contact-phone').addClass('error-field'));
                }
                else {
                    var phone = {};
                    phone.InfoType = 0;
                    phone.Category = $(phones[i]).find('select.phone-type option:selected"').val();
                    phone.Data = $(phones[i]).find('input.contact-phone').val();
                    if (i == 0) {
                        phone.IsPrimary = true;
                    }
                    else {
                        phone.IsPrimary = false;
                    }
                    contact_data.push(phone);
                }
            }
        }
        var emailes = $('div.ui-page-active div.fields-container[data = "email"]').find('div.info');
        for (var i = 0; i < emailes.length; i++) {
            $(emailes[i]).find('input.contact-email').removeClass('error-field');
            var emailes_i = $(emailes[i]).find('input.contact-email').val();
            if (emailes_i.length > 0) {
                if (emailes_i.search(/[\w]+[@][\w]+[.][a-zA-Z]+/) == -1) {
                    errors.push($(emailes[i]).find('input.contact-email').addClass('error-field'));
                }
                else {
                    var email = {};
                    email.InfoType = 1;
                    email.Category = $(emailes[i]).find('select.email-type option:selected"').val();
                    email.Data = $(emailes[i]).find('input.contact-email').val();
                    if (i == 0) {
                        email.IsPrimary = true;
                    }
                    else {
                        email.IsPrimary = false;
                    }
                    contact_data.push(email);
                }
            }
        }
        var addresses = $('div.ui-page-active').find('div.fields-container[data = "address"]').find("div.info");
        for (var i = 0; i < addresses.length - 1; i++) {
            if ($(addresses[i]).find("input.detail").val().length > 0 || $(addresses[i]).find("input.city").val().length > 0 || $(addresses[i]).find("input.state").val().length > 0 || $(addresses[i]).find("input.zipcode").val().length > 0) {
                var address = {};
                address.InfoType = 7;
                address.Category = address.Category = $(addresses[i]).find('select.address-type option:selected"').val();
                var country = $(addresses[i]).find("input.detail").val();
                var city = $(addresses[i]).find("input.city").val();
                var street = $(addresses[i]).find("input.street").val();
                var state = $(addresses[i]).find("input.state").val();
                var zipcode = $(addresses[i]).find("input.zipcode").val();
                address.data = '{\r\n  \"street\": \"' + street + '\",\r\n  \"city\": \"' + city + '\",\r\n  \"state\": \"' + state + '\",\r\n  \"zip\": \"' + zipcode + '\",\r\n  \"country\": \"' + country + '\"\r\n}';
                if (i == 0) {
                    address.IsPrimary = true;
                }
                else {
                    address.IsPrimary = false;
                }
                contact_data.push(address);
            }
        }
        var sites = $('div.ui-page-active').find('input.contact-site');
        for (var i = 0; i < sites.length; i++) {
            if ($(sites[i]).val().length > 0) {
                var site = {};
                site.InfoType = 2;
                site.Data = $(sites[i]).val();
                if (i == 0) {
                    site.IsPrimary = true;
                }
                else {
                    site.IsPrimary = false;
                }
                contact_data.push(site);
            }
        }
        if (errors.length == 0) {
            $button.removeClass("add-crm-persone");
            if ($button.hasClass("edit")) {
                return Teamlab.updateCrmPerson({}, $button.attr("data-id"), data, {
                    success: function(params, items) {
                        if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.editperson)) {
                            var new_data = { items: contact_data };
                            Teamlab.updateCrmContactData(null, items.id, new_data);
                            TeamlabMobile.onGetContact_(params, items);
                            ASC.Controls.AnchorController.move({ back: '#crm/contact/' + items.id }, '#crm/contact/' + items.id);
                        }
                    }
                });
            }
            else {
                return Teamlab.addCrmPerson(null, data, {
                    success: function(params, items) {
                        var new_data = { items: contact_data };
                        if (new_data.items.length > 0) Teamlab.addCrmContactData(null, items.id, new_data);
                        if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.addpersone)) {
                            ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + items.id }, '#crm/contact/' + items.id);
                        }
                    }
                });
            }
        }
        ASC.Controls.messages.show(Base64.encode(ASC.Resources.ErrEmpyField), 'error', ASC.Resources.ErrEmpyField);
        return false;
    }
    DefaultMobile.add_crm_history_event = function(evt, $page, $button) {
        if ($page.length === 0) {
            return undefined;
        }
        //$button.removeClass("add-crm-history-event");       
        var data = {
            contactId: $('div.ui-page-active').find('button.add-crm-history-event').attr('data-id')
        };
        var errors = [];
        if ($('div.ui-page-active').find('select.historyevent-type').attr('value') == -1) {
            errors.push($('div.ui-page-active').find('select.historyevent-type').parent().addClass('error-field'));
        }
        else {
            $('div.ui-page-active').find('select.historyevent-type').parent().removeClass('error-field');
            data.categoryId = $('div.ui-page-active').find('select.historyevent-type').attr('value');
        }
        if ($('div.ui-page-active').find('textarea.historyevent-description').val() == "" || $('div.ui-page-active').find('textarea.historyevent-description').val() == null) {
            errors.push($('div.ui-page-active').find('textarea.historyevent-description').addClass('error-field'));
        }
        else {
            data.content = $('div.ui-page-active').find('textarea.historyevent-description').removeClass('error-field').val();
        }
        if ($('div.ui-page-active').find('input.historyevent-date').val() == "" || $('div.ui-page-active').find('input.historyevent-date').val() == null) {
            errors.push($('div.ui-page-active').find('input.historyevent-date').addClass('error-field'));
        }
        else {
            data.created = new Date($('input.historyevent-date:first').removeClass('error-field').scroller('getDate'));
            var now = new Date();
            data.created.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        }
        if (errors.length == 0) {
            return Teamlab.addCrmHistoryEvent(null, data, { success: function() {
                if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.addhistoryevent)) {
                    ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + data.contactId + '/history' }, '#crm/contact/' + data.contactId + '/history');
                }
            }
            });
        }
        ASC.Controls.messages.show(Base64.encode(ASC.Resources.ErrEmpyField), 'error', ASC.Resources.ErrEmpyField);
        return false;
    }
    DefaultMobile.cansel_crm_task = function(evt, $page, $button) {
        if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.crmaddtask)) {
            if ($page.attr('data-itemid') != undefined && $page.attr('data-itemid') != '' && $page.attr('data-itemid') != null) {
                ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + $page.attr('data-itemid') + '/tasks' }, '#crm/contact/' + $page.attr('data-itemid') + '/tasks');
            }
            else {
                ASC.Controls.AnchorController.lazymove({ back: '#crm/tasks/today' }, '#crm/tasks/today');
            }
        }
    }
    DefaultMobile.cansel_crm_person = function(evt, $page, $button) {
        if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.crmaddtask)) {
            if ($page.attr('data-itemid') != undefined && $page.attr('data-itemid') != '' && $page.attr('data-itemid') != null) {
                ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + $page.attr('data-itemid') }, '#crm/contact/' + $page.attr('data-itemid'));
            }
            else {
                ASC.Controls.AnchorController.lazymove({ back: '#crm/tasks/today' }, '#crm/tasks/today');
            }
        }
    }
    DefaultMobile.delete_crm_history_event = function(evt, $page, $button) {
        if (confirm('Delete this event?')) {
            Teamlab.removeCrmHistoryEvent(null, $button.attr('data-id'), {
                success: function() {
                    if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.contacthistory)) {
                        $button.parent().parent().remove();
                    }
                }
            })
        }
        else { }
    }
    DefaultMobile.add = function(evt, $page, $button) {
        var $item = $button.parent().parent();
        var fields = [];
        fields = $item.find("div");
        if (fields.length < 5) {
            $item.find("div:first").clone().prependTo($button.parent().parent());
        }
        else {
            $button.parent().hide;
        }
    }
    DefaultMobile.delete_field = function(evt, $page, $button) {
        var $item = $button.parent();
        $item.remove();
    }
    DefaultMobile.group_responsible = function(evt, $page, $button) {
        Teamlab.getProfiles(null, {
            success: function(params, items) {
                $('.task-responsible').parent().remove();
                $('.assign').remove();
                if ($page.find('select.group-responsible option:selected"').val() != -1) {
                    $('.group-responsible').parent().after('<label class = "assign">Assign to:</label><select class="task-responsible" type="text"></select>');
                    var group_id = $('.group-responsible option:selected').val();
                    if (group_id == 0) {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].group == null) {
                                $('.task-responsible').append('<option value="' + items[i].id + '">' + items[i].displayName + '</option>');
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].group != null && items[i].group.id == group_id) {
                                $('.task-responsible').append('<option value="' + items[i].id + '">' + items[i].displayName + '</option>');
                            }
                        }
                    }
                    jQuery(document).trigger('updatepage');
                }
            }
        });
    }
    DefaultMobile.task_delete = function(evt, $page, $button) {
        if (confirm('Delete this task?')) {
            Teamlab.removeCrmTask(null, $page.attr('data-itemid'));
            if (ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.crmtask) || ASC.Controls.AnchorController.testAnchor(TeamlabMobile.regexps.contacttask)) {
                if ($page.attr("data-contactid") != null || $page.attr("data-contactid") != undefined) {
                    ASC.Controls.AnchorController.lazymove({ back: '#crm/contact/' + $page.attr("data-contactid") + '/tasks' }, '#crm/contact/' + $page.attr("data-contactid") + '/tasks');
                }
                else {
                    ASC.Controls.AnchorController.lazymove({ back: '#crm/tasks/today' }, '#crm/tasks/today');
                }
            }
        }
        else { }
    }
    /*DefaultMobile.add_phone = function(evt, $page, $button){
    DefaultMobile.edit_contact = function(evt, $page, $button) {
        TeamlabMobile.editCrmContact($button.attr('data-id'));
    }
    DefaultMobile.crm_add_note_to_contact = function(evt, $page, $button) {
        var data = getContactNoteData($page);
        if (data && TeamlabMobile.addCrmNoteToContact(data.contactid, data)) {
            jQuery(document).trigger('changepage');
            $button.addClass('disabled');
        }
    }
    return DefaultMobile;
})(DefaultMobile);
        data = {items: data}
        $('.ui-page-active').find('.loading-indicator').hide();
        if(!params.nextIndex){
            $('div.ui-page-active').find('span.load-more-items').hide();
        }        
        $('.ui-page-active').find('ul.ui-timeline:first').append(DefaultMobile.processTemplate(params.tmpl, data));    
        data = {items: data}
        $('.ui-page-active').find('.loading-indicator').hide();
        if(!params.nextIndex){
            $('div.ui-page-active').find('span.load-more-items').hide();
        }        
        $('.ui-page-active').find('ul.ui-timeline:first').append(DefaultMobile.processTemplate(TeamlabMobile.templates.lbcrmtaskstimeline, data));    