var app = app || {};
var socket = io();

socket.activeChannel = 'general';
socket.emit('login', '', function(user) {
  socket.user = user;
  socket.username = user.username;
});
// RECONNECT COMPONENT
var ReconnectComponent = require('../../views/components/reconnect.jsx')(socket);

// CHAT MODULE
var ChatComponent = require('../../views/components/message.jsx')(socket);

// CHANNEL LIST MODULE
var ChannelComponent = require('../../views/components/channel.jsx')(socket);

// USERS LIST
var UserComponent = require('../../views/components/userlist.jsx')(socket);

// PROFILE MODULE
var ProfileComponent = require('../../views/components/profile.jsx')(socket);

// SETTING MODULE
var SettingComponent = require('../../views/components/setting.jsx')(socket);

// SEARCH RESULTS
var SearchResultComponent = require('../../views/components/search-result.jsx')(socket);

(function () {
  'use strict';

  var Title = React.createClass({
    render: function () {
      return (
        <div className="heading">
          <h3 className="heading__header">Shriek Chat</h3>
        </div>
      );
    }
  });

  var ChatApp = React.createClass({
    render: function () {
      var menu, main;

      menu = (
        <div className="nav">
          <Title />
          <ChannelComponent />
          <UserComponent />
        </div>
      );

      main = (
        <div className="content">
          <ProfileComponent />
          <ChatComponent />
        </div>
      );

      return (
        <div className="container">
          {menu}
          {main}
        </div>
      );
    }
  });

  var Content = React.createClass({
    render: function () {
      return (
        <div className="layout">
          <ReconnectComponent />
          <SettingComponent />
          <SearchResultComponent />
          <ChatApp />
        </div>
      );
    }
  });

  function render() {
    ReactDOM.render(
      <Content />,
      document.getElementById('app')
    );
  }
  socket.emit('user list');
  socket.emit('channel list');
  socket.emit('channel join', {
    channel: 'general'
  });
  socket.emit('user info', {username: socket.username});
  render();

})();
