var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 4998);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type:  'textinput',
			id:    'host',
			label: 'Device IP',
			width: 12,
			regex: self.REGEX_IP
		},
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};


instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'recordReady':   { label: 'recordReady' },
		'play':          { label: 'play' },
		'pause':         { label: 'pause' },
		'stop':          { label: 'stop' },
		'finalize':      { label: 'finalize' },
		'enter':         { label: 'enter' },
		'open':          { label: 'open' }
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd  = 'sendir,1:1,1,';
	var opt  = action.options;

	switch (action.action) {

		case 'recordReady':
			cmd += '38343,1,1,344,171,22,63,22,20,22,20,22,21,21,21,21,21,21,21,21,65,21,21,21,21,21,64,22,20,22,20,22,64,22,20,22,20,22,64,22,20,22,63,22,21,22,20,22,20,22,20,21,21,22,20,22,64,21,21,21,65,21,64,22,64,21,64,22,63,22,1706,344,85,22,3657,344,85,22,3657,344,85,22,3800';
			break;

		case 'play':
			cmd += '38343,1,1,344,170,22,64,22,20,22,20,22,20,22,20,22,20,22,20,22,64,22,20,22,20,22,64,21,21,22,20,22,64,21,21,21,21,22,63,22,64,22,20,22,20,22,20,22,20,22,20,22,21,21,21,21,21,21,64,22,64,22,64,21,64,22,64,22,63,22,1705,344,85,22,3657,344,85,21,3657,344,85,22,3657,344,85,22,3656,344,85,22,3657,344,85,22,3656,344,85,22,3657,344,85,22,3657,343,85,22,3657';
			break;

		case 'pause':
			cmd += '38226,1,1,344,170,22,64,22,20,22,20,22,20,22,20,22,20,22,20,22,64,22,20,22,20,22,63,22,21,22,20,22,63,22,20,22,21,22,20,22,20,21,64,22,21,21,21,21,21,21,21,21,21,22,63,22,64,22,20,22,64,22,64,21,64,22,64,21,64,22,1699,344,85,22,3646,105,4,4,314,21,3646,35,393,21,3647,29,4,4,396,16,3651,71,4,4,351,22,3646,28,4,4,396,15,3652,344,85,22,4892';
			break;

		case 'stop':
			cmd += '38343,1,1,344,171,22,63,22,20,22,20,22,21,22,20,22,20,22,20,21,65,21,21,21,21,21,64,22,21,21,21,21,64,22,20,22,20,22,20,22,64,22,20,22,20,22,20,22,20,22,20,22,21,21,64,22,20,22,64,21,65,21,64,22,64,21,64,22,63,22,1706,344,85,21,3657,344,85,22,3657,344,85,22,3656,344,85,22,3657,344,85,22,3656,344,85,22,3657,344,85,22,3656,344,85,22,3657,344,85,22,3657';
			break;

		case 'finalize':
			cmd += '38343,1,1,344,170,22,64,22,20,22,20,22,20,22,20,22,20,22,20,22,64,22,20,22,20,22,64,21,21,22,20,22,64,21,21,21,21,22,20,22,63,22,64,22,64,22,63,22,20,22,64,22,20,22,64,22,20,22,20,22,20,22,20,22,64,22,20,22,63,22,1706,343,86,21,3658,343,85,22,3658,343,85,22,3800';
			break;

		case 'enter':
			cmd += '38343,1,1,343,171,22,64,21,21,21,21,21,21,22,20,22,20,22,20,22,64,22,20,22,20,22,63,22,21,21,21,21,64,22,20,22,21,21,21,21,21,21,64,22,64,22,64,21,21,21,21,21,21,22,63,22,64,22,20,22,20,22,20,22,64,22,63,22,64,21,1703,344,85,22,3656,344,85,22,3800';
			break;

		case 'open':
			cmd += '38343,1,1,344,171,21,64,22,20,22,20,22,20,22,20,22,20,22,20,22,64,22,20,22,20,22,64,22,20,22,20,22,64,21,21,21,21,22,64,21,21,21,21,21,21,22,20,22,20,22,20,22,20,22,20,22,64,22,63,22,64,22,64,22,63,22,64,22,63,22,1706,344,85,21,3658,343,86,21,3658,343,86,21,3658,343,85,22,3800';
			break;
	}

	if (cmd !== undefined) {

		debug('sending tcp', cmd, "to", self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\r\n");
		} else {
			debug('Socket not connected :(');
		}

	}

	debug('action():', action);


};

instance.module_info = {
	label:   'Global Cache - iTach IP2IR - CD-RW900MK2',
	id:      'gc-itac-ir-cdrw900mk2',
	version: '0.0.1'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
