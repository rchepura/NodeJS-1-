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
        },
        events: {
            'click .add-rule': "onAddRule",
            'click .save-rule': "saveRule",
            'click .remove-rules': "removeRule",
            'click .add-action': "onAddAction",
            'click .save-action': "saveAction",
            'click .remove-action': "removeAction"
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
                $input = $elem.parent().find('input'),
                model = new me.Model(),
                data = {}, ruleName = $.trim($input.val());
                
                if ( !ruleName ) {
                    Alerts.Error.display({title: 'Error', content: "Rule name cannot be empty"});
                    return;
                }
                
                data = {
                    "conditionJexl" : "type\u003dMOVEMENT",
                    "action" : {
                        "actionTemplateName" : "Camera Action Template",
                        "actionTemplateDescription" : "this is camera card template",
                        "type" : "GAMERA",
                        "push" : true,
                        "pushPayload" : "this is test card push",
                        "expirationHour" : 20,
                        "expirationMin" : 0,
                        "expirationDays" : 0
                    },
//                    "ruleName" : "Movement rule",
                    "ruleName" : ruleName,
                    "description" : "Rule to detect movement",
                    "timeCreated" : 0
                };
            
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
                lastRuleID = $container.find('.list-row').last().attr('did');
        
                if ( lastRuleID ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/rules/rule/' + lastRuleID,
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
                $input = $elem.parent().find('input'),
                model = new me.Model(),
                data = {}, ruleActionName = $.trim($input.val());
                
                if ( !ruleActionName ) {
                    Alerts.Error.display({title: 'Error', content: "Rule Action Name cannot be empty"});
                    return;
                }
                
                data = {
//                    "actionTemplateName" : "Camera Action Template",
                    "actionTemplateName" : ruleActionName,
                    "actionTemplateDescription" : "this is camera card template",
                    "type" : "GAMERA",
                    "push" : true,
                    "pushPayload" : "this is test card push",
                    "expirationHour" : 20,
                    "expirationMin" : 0,
                    "expirationDays" : 0
                };
 
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
                lastRuleID = $container.find('.list-row').last().attr('did');
        
                if ( lastRuleID ) {
                Util.showSpinner();
                model.destroy({
                    url: 'api/rules/action/' + lastRuleID,
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
        renderActions: function(rules) {
            var me = this,
                template = _.template($('#templateActionsView').html(), {data: rules});
            
            
            me.$el.find('.actions-container .item-list').html(template);
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