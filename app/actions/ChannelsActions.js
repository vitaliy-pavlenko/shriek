var alt_obj = require('./../controllers/alt_obj');

var ChannelsActions = alt_obj.createActions({
  displayName: 'ChannelsActions', // обязательное поле в ES5

  updateChannels: function (channels) {  // на эту функцию мы будем подписываться в сторе
    this.dispatch(channels); // это блин ТРИГГЕР, на который реагирует стор
  },
  setActiveChannel: function (channelSlug) {
    this.dispatch(channelSlug);
  },

  initChannels: function (socket) { // это функция инициализации, тут мы подписываемся на сообщение из сокета
    var that = this;
    socket.on('channel list', function (data) {
      that.actions.updateChannels(data); // получили данные и передали в функцию, которая умеет триггерить стор
    });
    socket.on('channel get', function (data) {
      that.actions.setActiveChannel(data.slug);
    });


  },

  getChannels: function (socket) {
    socket.emit('channel list'); // дергаем бекенд, чтобы получить список каналов
  }

});

module.exports = alt_obj.createActions('ChannelsActions', ChannelsActions); // первый параметр имя экшена — обязательный в ES5
