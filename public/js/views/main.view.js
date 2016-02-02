define(['jquery', 'backbone', 'moment'], function($, Backbone, Moment) {
    var LoginView = Backbone.View.extend({
        el: '#id-rules-wrapper',
        Model: Backbone.Model.extend({urlRoot : 'api'}),
        moment: Moment,
        initialize: function() {
            var me = this;           
            
            window.MAIN_VIEW = me;

            me.options.eventPubSub.bind("initMain", function() {
                me.init();
            });
            
//            me.$el.find('input[name="timeCreated"]').datepick({
//                inline: true,
////                showOnFocus: false,
////                showTrigger: '<img src="images/assets/ic_calendar.png" class="datepick-trigger exp-col-edit">',
////                minDate: new Date(),
//                onSelect: function (date) {
//                    me.$el.find('input[name="timeCreated"]').val($.datepick.formatDate("mm/dd/yyyy", date[0]));
//                }
//            });
        },
        events: {
            'click .add-rule': "onAddRule",
            'click .save-rule': "saveRule",
            'click .remove-rule': "removeRule",
            'click .add-action': "onAddAction",
            'click .save-action': "saveAction",
            'click .remove-action': "removeAction",
            'click .list-row': "selectListRow"
        },
        selectListRow: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                $elParent = $elem.parent();
            
            if ( !$elem.hasClass('active') ) {
                $elParent.find('.list-row.active').removeClass('active');
                $elem.addClass('active');
                $elParent.find('.remove-rule, .remove-action').attr('disabled', false);
            } else {
                $elem.removeClass('active');
                $elParent.find('.remove-rule, .remove-action').attr('disabled', true);
            }
        },
        onAddRule: function(e) {
            var me = this;
            
            me.$el.find('.new-rule-container .new-window-box').fadeIn();
        },
        addRule: function(text) {
            var me = this,
                $container = me.$el.find('.rules-container .item-list'),
                listSize = $container.find('.list-row').length;
        
            if ( 0 !== listSize ) {
                $container.find('.list-row').last().after(_.template($('#templateRoleRow').html(), {model: {title: text}}));
            } else {
                $container.prepend(_.template($('#templateRoleRow').html(), {model: {title: text}}));
            }
        },
        getRules: function(cb) {
            var me = this,
                rule = new me.Model();
            
            Util.showSpinner();
            rule.fetch({
                url: 'api/rules/rules',
                success: function(model, res) {
                    if ( res && false !== res.success ) {
                        me.currRules = res || [];
                        if ( cb ) {
                            cb(res || []);
                        }
                    } else {
                        Alerts.Error.display({
                            title: 'Error',
                            content: 'Authorization Failed.'
                        });
//                        Backbone.history.navigate('#/logout');
                    }
                },
                complete: function(res) {
                    if ( 401 == (res || {}).status ) {
                        Alerts.Error.display({
                            title: 'Error',
                            content: 'Authorization Failed.'
                        });
//                        Backbone.history.navigate('#/logout');
                    }
                    Util.hideSpinner();
                }
            });
        },
        getActions: function(cb) {
            var me = this,
                rule = new me.Model();
            
            Util.showSpinner();
            rule.fetch({
                url: 'api/rules/actions',
                success: function(model, res) {
                    if ( res && false !== res.success ) {
                        me.currRules = res || [];
                        if ( cb ) {
                            cb(res || []);
                        }
                    } else {
                        Alerts.Error.display({
                            title: 'Error',
                            content: 'Authorization Failed.'
                        });
//                        Backbone.history.navigate('#/logout');
                    }
                },
                complete: function(res) {
                    if ( 401 == (res || {}).status ) {
                        Alerts.Error.display({
                            title: 'Error',
                            content: 'Authorization Failed.'
                        });
//                        Backbone.history.navigate('#/logout');
                    }
                    Util.hideSpinner();
                }
            });
        },
        saveRule: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                $parent = $elem.closest('.new-window-box'),
                $inputFields = $parent.find('input.rule-field'),
                $inputActionFields = $parent.find('.rule-action-pane input'),
                model = new me.Model(),
                data = {};
                
                $inputFields.each(function() {
                    var $this = $(this);
                    data[$this.attr('name')] = $.trim($this.val());
                });
                data.action = {};
                $inputActionFields.each(function() {
                    var $this = $(this);
                    
                    if ( 'checkbox' == $this.attr('type') ) {
                        data.action[$this.attr('name')] = $this.get(0).checked;
                    } else {
                        data.action[$this.attr('name')] = $.trim($this.val());
                    }
                });
                
                console.dir(data);
                
                top.RULESDATA = data;
                
                if ( !data.ruleName ) {
                    Alerts.Error.display({title: 'Error', content: "Rule name cannot be empty"});
                    return;
                }
                
//                data = {
//                    "conditionJexl" : "type\u003dMOVEMENT",
//                    "action" : {
//                        "actionTemplateName" : "Camera Action Template",
//                        "actionTemplateDescription" : "this is camera card template",
//                        "type" : "GAMERA",
//                        "push" : true,
//                        "pushPayload" : "this is test card push",
//                        "expirationHour" : 20,
//                        "expirationMin" : 0,
//                        "expirationDays" : 0
//                    },
////                    "ruleName" : "Movement rule",
//                    "ruleName" : ruleName,
//                    "description" : "Rule to detect movement",
//                    "timeCreated" : 0
//                };
            
//            me.addRule($input.val()); 
            me.showLoader();
            
            model.save(data, {
                url: 'api/rules/rule',
                success: function (model, res) {
                    me.hideLoader();
                    if ( _.isObject(res) ) {
                        if ( !_.isEmpty(res) ) {
                            me.getRules(function(rules) {
                                me.renderRules(rules);
                            });
                            me.$el.find('.new-rule-container .new-window-box').fadeOut();
                        } else {
                            Alerts.Error.display({title: 'Error', content: "Failed during create Rule"});
                        }
                    }
                },
                error: function () {
                    Alerts.Error.display({title: 'Error', content: "Failed during generate report"});
                    me.hideLoader();
                }
            });
            return false;
        },
        removeRule: function(e) {
            var me = this,            
                model = new me.Model({id: 'del'}),
                $elem = $(e.currentTarget),
                $container = $elem.closest('.item-list'),
                ruleID = $container.find('.list-row.active').attr('did');
        
            if ( ruleID ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/rules/rule/' + ruleID,
                    complete: function(res) {
                        if ( 200 == (res || {}).status ) {
                            me.getRules(function(rules) {
                                me.renderRules(rules);
                            });
                        } else {
                            Alerts.Error.display({
                                title: 'Error',
                                content: 'Failed Delete'
                            });
                        }
                        Util.hideSpinner();
                    }
                });
            }       
        },
        onAddAction: function(e) {
            var me = this;

            me.$el.find('.new-action-container .new-window-box').fadeIn();
        },
        saveAction: function(e) {
            var me = this,
                $elem = $(e.currentTarget),
                $inputFields = $elem.closest('.new-window-box').find('input'),
                model = new me.Model(),
                data = {};
                
                top.$elem = $elem;
                top.JJJ = $inputFields;
                
                $inputFields.each(function() {
                    var $this = $(this);
                    
                    if ( 'checkbox' == $this.attr('type') ) {
                        data[$this.attr('name')] = $this.get(0).checked;
                    } else {
                        data[$this.attr('name')] = $.trim($this.val());
                    }                    
                });
                
                data.timeCreated = (new Date()).getTime();
                
                console.dir(data);
                
                top.NEW_ACTION_DATA = data;
                
                
                if ( !data.actionTemplateName ) {
                    Alerts.Error.display({title: 'Error', content: "Rule Action Name cannot be empty"});
                    return;
                }
                
//                data = {
////                    "actionTemplateName" : "Camera Action Template",
//                    "actionTemplateName" : ruleActionName,
//                    "actionTemplateDescription" : "this is camera card template",
//                    "type" : "GAMERA",
//                    "push" : true,
//                    "pushPayload" : "this is test card push",
//                    "expirationHour" : 20,
//                    "expirationMin" : 0,
//                    "expirationDays" : 0
//                };
 
            me.showLoader();
            
            model.save(data, {
                url: 'api/rules/action',
                success: function (model, res) {
                    me.hideLoader();
                    if ( _.isObject(res) ) {
                        if ( !_.isEmpty(res) ) {
                            me.getActions(function(actions) {
                                me.renderActions(actions);
                            });
                            me.$el.find('.new-action-container .new-window-box').fadeOut();
                        } else {
                            Alerts.Error.display({title: 'Error', content: "Failed during create Rule"});
                        }
                    }
                },
                error: function () {
                    Alerts.Error.display({title: 'Error', content: "Failed during generate report"});
                    me.hideLoader();
                }
            });
            return false;

        },
        addAction: function(text) {
            var me = this,
                $container = me.$el.find('.actions-container .item-list'),
                listSize = $container.find('.list-row').length;
        
            if ( 0 !== listSize ) {
                $container.find('.list-row').last().after(_.template($('#templateActionRow').html(), {model: {title: text}}));
            } else {
                $container.prepend(_.template($('#templateActionRow').html(), {model: {title: text}}));
            }
        },
        removeAction: function(e) {            
            var me = this,            
                model = new me.Model({id: 'del'}),
                $elem = $(e.currentTarget),
                $container = $elem.closest('.item-list'),
                actionID = $container.find('.list-row.active').attr('did');
        
            if ( actionID ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/rules/action/' + actionID,
                    complete: function(res) {
                        if ( 200 == (res || {}).status ) {
                            me.getActions(function(actions) {
                                me.renderActions(actions);
                            });
                        } else {
                            Alerts.Error.display({
                                title: 'Error',
                                content: 'Failed Delete Action'
                            });
                        }
                        Util.hideSpinner();
                    }
                });
            }       
        },
        renderRules: function(rules) {
            var me = this,
                template = _.template($('#templateRulesView').html(), {data: rules});
            
            
            me.$el.find('.rules-container .item-list').html(template);
        },
        renderActions: function(actions) {
            var me = this,
                template = _.template($('#templateActionsView').html(), {data: actions}),
                $actionSelect = me.$el.find('.new-rule-container select[name="action"]').empty();
            
            me.AllActions = {};
            
            _.each(actions, function (model, key) {
                me.AllActions[model.actionTemplateId] = model;
                $actionSelect.append('<option value="' + model.actionTemplateId + '">' + model.actionTemplateName + '</option>');
            });
            
            me.$el.find('.actions-container .item-list').html(template);
            $actionSelect.on('change', function() {
                me.renderNewRuleActions($(this).val());
            });
            me.renderNewRuleActions($actionSelect.val());
        },
        renderNewRuleActions: function(actionTemplateId) {
            var me = this,                
                template = _.template($('#templateActionFormView').html(), {model: me.AllActions[actionTemplateId] || {}});            
            
            me.$el.find('.new-rule-container .rule-action-pane').html(template);
        },
        init: function() {
            var me = this;
            
            me.getRules(function(rules) {
                me.renderRules(rules);
            });            
            me.getActions(function(actions) {
                me.renderActions(actions);
            });            
        },
        showLoader: function() {
            Util.showSpinner();
        },
        hideLoader: function() {
            Util.hideSpinner();
        }
    });

    return LoginView;
});