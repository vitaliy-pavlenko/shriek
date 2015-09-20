var ProfileComponent = function (socket) {

  var ProfileBlock = React.createClass({

    getInitialState: function () {
      return {
        image: 'http://cs540109.vk.me/c7005/v7005764/55da/NuoVVyzCGGs.jpg'
      };
    },

    componentDidMount: function () {
      var _this = this;

      socket.on('user info', function (data) {
        if (data.status === 'ok') {
          _this.setState({image: data.user.setting.image});
        }
      });
    },

    handleSettingOpen: function (e) {
      window.dispatchEvent(new Event('openSetting'));
    },

    logout: function () {
      socket.emit('user leave');
    },

    render: function () {
      return (
        <div className='profile'>
          <div className="profile__out" onClick={this.logout}><i className="fa fa-power-off fa-lg"></i></div>
          <div className="profile__tools" onClick={this.handleSettingOpen}><i className="fa fa-cog fa-lg"></i></div>
          <div className="profile__img">
            <img src={this.state.image}/>
          </div>
        </div>
      );
    }
  });

  return ProfileBlock;
};

module.exports = ProfileComponent;
