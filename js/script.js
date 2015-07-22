var syncpage = "http://192.168.1.8/wm/admin/conteudo/sync/"

// Criação do Banco de Dados
var db = new Dexie("WMRepresentacoes");
// s = 0 -> Não sincronizado / Criado aqui
// s = 1 -> Não sincronizado / Criado lá (possui ID)
// s = 2 -> Sincronizado
db.version(1).stores({
	clientes: "++idx, id, razaoSocial, nomeFantasia, cnpj, inscEstadual, suframa, endereco, complemento, cep, bairro, cidade, estado, telefone1, telefone2, fax, email1, email2, informacoesAdicionais, contato1, cargoContato1, telefoneContato1, emailContato1, contato2, cargoContato2, telefoneContato2, emailContato2, ultimaCompra, s",
	representadas: "++idx, id, razaoSocial, nomeFantasia, cnpj, comissao, telefone, email, informacoesAdicionais, contato1, cargoContato1, telefoneContato1, emailContato1, contato2, cargoContato2, telefoneContato2, emailContato2, cep, endereco, complemento, bairro, cidade, estado, s",
	produtos: "++idx, id, representada, nome, codigo, ipi, precoTabela, precoTabela2, precoTabela3, precoTabela4, s",
	listadeprodutos: "++idx, id, produto, quantidade, descontos, precoLiquido, subtotal, pedido, s",
	pedidos: "++idx, id, representada, cliente, vendedor, dataEmissao, dataFaturamento, quantidadeTotal, totalSemDescontos, semitotal, total, transportadora, condicaoDePagamento, informacoesAdicionais, status, s"
});
db.open();

/* FUNÇÕES GERAIS */

function myParseFloat( n ) {
	if( !isNaN( n ) )
		return parseFloat(n);
	
	l = n.length;
	res = 0;
	f = 0;
	
	for( i = 0; i < l; ++i )
	{
		if( n[i] >= '0' && n[i] <= '9' )
		{
			res *= 10;
			res += parseInt(n[i]);
			if( f != 0 )
				++f;
		}
		
		if( n[i] == ',' && f == 0 )
			f++;
	}
	
	if( f )
		return res / Math.pow(10, f-1);
	else
		return res;
}
function commaToPointSeparator( n ) {
	a = n.split(',');
	
	b = a[0].split('.');
	if(b[1])
		a[0] = parseInt(b[0]) * Math.pow(10, b[1].length) + parseInt(b[1]);
	
	signal = 0;
	if( a[0][0] == '-' )
		signal = 1;
	
	if( a[1] )
	{
		m = Math.pow(10, a[1].length);
		b = m * parseInt(a[0]);
		if( signal == 0 )
			b = b + parseInt(a[1]);
		else
			b = b - parseInt(a[1]);
		b = b / m;
	}
	else
		b = a[0];
	
	return b;
}
function pointToCommaSeparator( n ) {
	if( n == 0 || isNaN( n ) )
		return '0,00';
	
	if( n > 0 )
		signal = 0;
	else
		signal = 1;
	
	
	n = Math.round(100 * Math.abs(n));
	i = 0;
	
	p = '';
	
	while( n != 0 )
	{
		p = (n % 10) + p;
		n = parseInt(n / 10);

		if( ++i == 2 )
			p = ',' + p;
		
		if( i % 3 == 2 && i >= 5 && n != 0 )
			p = '.' + p;
	}
	
	if( p[0] == ',' )
		p = '0' + p;
	
	if (signal)
		p = '-' + p;
	
	return p;
}



/* FUNÇÕES DE LISTAGEM */

function mostrarTodosOsClientes() {
	var a = '';
	db.clientes.each(function(c){
		a = a + "<div onclick='window.location.href = \"visualizar/clientes.html?id="+ c.idx +"\"' class='listagem_item'><i class='listagem_item_sinc_"+ c.s +"'></i><span class='listagem_item_title'>Cliente:</span> <span class='listagem_item_val'>"+ c.nomeFantasia +"</span> - <span class='listagem_item_title'>CNPJ:</span> <span class='listagem_item_val'>"+ c.cnpj +"</span></div>";
		var x = document.getElementById("listagem");
		x.innerHTML = a;
	});
}
function mostrarTodasAsRepresentadas() {
	var a = '';
	db.representadas.each(function(c){
		a = a + "<div onclick='window.location.href = \"visualizar/representadas.html?id="+ c.idx +"\"' class='listagem_item'><i class='listagem_item_sinc_"+ c.s +"'></i><span class='listagem_item_title'>Representada:</span> <span class='listagem_item_val'>"+ c.nomeFantasia +"</span> - <span class='listagem_item_title'>CNPJ:</span> <span class='listagem_item_val'>"+ c.cnpj +"</span></div>";
		var x = document.getElementById("listagem");
		x.innerHTML = a;
	});
}
function mostrarTodosOsProdutos() {
	var a = '';
	db.produtos.each(function(c){
		db.representadas.where('id').equals(c.representada).each(function(r){
			a = a + "<div onclick='window.location.href = \"visualizar/produtos.html?id="+ c.idx +"\"' class='listagem_item'><i class='listagem_item_sinc_"+ c.s +"'></i><span class='listagem_item_title'>Produto:</span> <span class='listagem_item_val'>"+ c.nome +"</span> - <span class='listagem_item_title'>Representada:</span> <span class='listagem_item_val'>"+ r.nomeFantasia +"</span></div>";
			var x = document.getElementById("listagem");
			x.innerHTML = a;
		});
	});
}
function fillRepresentadas(id) {
	var a = '<option></option>';
	db.representadas.each(function(c){
		if( c.id == 0 )
			return;
		
		a = a + "<option value='"+ c.id +"'>"+ c.nomeFantasia +"</option>";
		x = document.getElementById(id);
		x.innerHTML = a;
	});
}


/* PREPARAÇÃO INICIAL DA PÁGINA */

$(document).ready(function(){
	
	$.mask.definitions['~']='[ 9]';
	$(".cnpj_field").mask("99.999.999/9999-99");
	$(".cep_field").mask("99999-999");
	$(".phone_field").mask("(99) ~9999-9999");
	$(".inscEstadual_field").mask("99999999-9");
	$(".percent_field").change(function(){
		obj = $(this);
		n = myParseFloat(obj.val());
		if( n < 0 )
			n = 0;
		else if( n > 100 )
			n = 100;
		
		obj.val(pointToCommaSeparator(n) + "%");
	});
	$(".currency_field").change(function(){
		obj = $(this);
		n = myParseFloat(obj.val());
		obj.val("R$ " + pointToCommaSeparator(n));
	});
	

	
	$("#cad-cliente_form").submit(function(e){
		e.preventDefault();
		
		db.clientes.add({
			id: 0,
			razaoSocial: $("#razaoSocial").val(),
			nomeFantasia: $("#nomeFantasia").val(),
			cnpj: $("#cnpj").val(),
			inscEstadual: $("#inscEstadual").val(),
			suframa: $("#suframa").val(),
			endereco: $("#endereco").val(),
			complemento: $("#complemento").val(),
			cep: $("#cep").val(),
			bairro: $("#bairro").val(),
			cidade: $("#cidade").val(),
			estado: $("#estado").val(),
			telefone1: $("#telefone1").val(),
			telefone2: $("#telefone2").val(),
			email1: $("#email1").val(),
			email2: $("#email2").val(),
			informacoesAdicionais: $("#informacoesAdicionais").val(),
			contato1: $("#contato1").val(),
			cargoContato1: $("#cargoContato1").val(),
			telefoneContato1: $("#telefoneContato1").val(),
			emailContato1: $("#emailContato1").val(),
			contato2: $("#contato2").val(),
			cargoContato2: $("#cargoContato2").val(),
			telefoneContato2: $("#telefoneContato2").val(),
			emailContato2: $("#emailContato2").val(),
			ultimaCompra: $("#ultimaCompra").val(),
			s: 0,
		}).then(function(){
			window.location.href = "../index.html";
		});
	});
	$("#cad-representada_form").submit(function(e){
		e.preventDefault();
		
		db.representadas.add({
			id: 0,
			razaoSocial: $("#razaoSocial").val(),
			nomeFantasia: $("#nomeFantasia").val(),
			cnpj: $("#cnpj").val(),
			comissao: $("#comissao").val(),
			endereco: $("#endereco").val(),
			complemento: $("#complemento").val(),
			cep: $("#cep").val(),
			bairro: $("#bairro").val(),
			cidade: $("#cidade").val(),
			estado: $("#estado").val(),
			telefone: $("#telefone").val(),
			email: $("#email").val(),
			informacoesAdicionais: $("#informacoesAdicionais").val(),
			contato1: $("#contato1").val(),
			cargoContato1: $("#cargoContato1").val(),
			telefoneContato1: $("#telefoneContato1").val(),
			emailContato1: $("#emailContato1").val(),
			contato2: $("#contato2").val(),
			cargoContato2: $("#cargoContato2").val(),
			telefoneContato2: $("#telefoneContato2").val(),
			emailContato2: $("#emailContato2").val(),
			s: 0,
		}).then(function(){
			window.location.href = "../index.html";
		});
	});
	$("#cad-produtos_form").submit(function(e){
		e.preventDefault();
		
		db.produtos.add({
			id: 0,
			representada: $("#representada").val(),
			nome: $("#nome").val(),
			codigo: $("#codigo").val(),
			ipi: myParseFloat($("#IPI").val()),
			precoTabela: myParseFloat($("#precoTabela").val()),
			precoTabela2: myParseFloat($("#precoTabela2").val()),
			precoTabela3: myParseFloat($("#precoTabela3").val()),
			precoTabela4: myParseFloat($("#precoTabela4").val()),
			s: 0,
		}).then(function(){
			window.location.href = "../index.html";
		});
	});
	
	
	$("#limpa_form").click(function(){
		$(this).parent()[0].reset();
	});
	
	$("#sincronizar").click(function(){
		db.transaction("r", db.clientes, db.representadas, db.produtos, db.listadeprodutos, db.pedidos, function(){
			db.clientes.where("s").below(2).each(function(c){
				if( c.s == 0 ) // Nova entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "clientes.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=2&razaoSocial=" + c.razaoSocial + "&nomeFantasia=" + c.nomeFantasia + "&CNPJ=" + c.cnpj + "&telefone1=" + c.telefone1 + "&telefone2=" + c.telefone2 + "&email1=" + c.email1 + "&email2=" + c.email2 + "&inscEstadual=" + c.inscEstadual + "&suframa=" + c.suframa + "&informacoesAdicionais=" + c.informacoesAdicionais + "&contato1=" + c.contato1 + "&cargoContato1=" + c.cargoContato1 + "&telefoneContato1=" + c.telefoneContato1 + "&emailContato1=" + c.emailContato1 + "&contato2=" + c.contato2 + "&cargoContato2=" + c.cargoContato2 + "&telefoneContato2=" + c.telefoneContato2 + "&emailContato2=" + c.emailContato2 + "&cep=" + c.cep + "&endereco=" + c.endereco + "&complemento=" + c.complemento + "&bairro=" + c.bairro + "&cidade=" + c.cidade + "&estado=" + c.estado,
						sucess: function(){
							console.log("Success 1");
						},
						error: function(e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 1 ) // Edição de entrada existente
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "clientes.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=3&razaoSocial=" + c.razaoSocial + "&nomeFantasia=" + c.nomeFantasia + "&CNPJ=" + c.cnpj + "&telefone1=" + c.telefone1 + "&telefone2=" + c.telefone2 + "&email1=" + c.email1 + "&email2=" + c.email2 + "&inscEstadual=" + c.inscEstadual + "&suframa=" + c.suframa + "&informacoesAdicionais=" + c.informacoesAdicionais + "&contato1=" + c.contato1 + "&cargoContato1=" + c.cargoContato1 + "&telefoneContato1=" + c.telefoneContato1 + "&emailContato1=" + c.emailContato1 + "&contato2=" + c.contato2 + "&cargoContato2=" + c.cargoContato2 + "&telefoneContato2=" + c.telefoneContato2 + "&emailContato2=" + c.emailContato2 + "&cep=" + c.cep + "&endereco=" + c.endereco + "&complemento=" + c.complemento + "&bairro=" + c.bairro + "&cidade=" + c.cidade + "&estado=" + c.estado + "&id=" + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(e) {
							console.error(e);
						}
					});
				}
			});
			db.representadas.where("s").below(2).each(function(c){
				if( c.s == 0 ) // Nova entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "representadas.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=2&razaoSocial=" + c.razaoSocial + "&nomeFantasia=" + c.nomeFantasia + "&CNPJ=" + c.cnpj + "&comissao=" + c.comissao + "&telefone=" + c.telefone + "&email=" + c.email + "&informacoesAdicionais=" + c.informacoesAdicionais + "&contato1=" + c.contato1 + "&cargoContato1=" + c.cargoContato1 + "&telefoneContato1=" + c.telefoneContato1 + "&emailContato1=" + c.emailContato1 + "&contato2=" + c.contato2 + "&cargoContato2=" + c.cargoContato2 + "&telefoneContato2=" + c.telefoneContato2 + "&emailContato2=" + c.emailContato2 + "&cep=" + c.cep + "&endereco=" + c.endereco + "&complemento=" + c.complemento + "&bairro=" + c.bairro + "&cidade=" + c.cidade + "&estado=" + c.estado,
						sucess: function(){
							console.log("Success 1");
						},
						error: function(e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 1 ) // Edição de entrada existente
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "representadas.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=3&razaoSocial=" + c.razaoSocial + "&nomeFantasia=" + c.nomeFantasia + "&CNPJ=" + c.cnpj + "&comissao=" + c.comissao + "&telefone=" + c.telefone + "&email=" + c.email + "&informacoesAdicionais=" + c.informacoesAdicionais + "&contato1=" + c.contato1 + "&cargoContato1=" + c.cargoContato1 + "&telefoneContato1=" + c.telefoneContato1 + "&emailContato1=" + c.emailContato1 + "&contato2=" + c.contato2 + "&cargoContato2=" + c.cargoContato2 + "&telefoneContato2=" + c.telefoneContato2 + "&emailContato2=" + c.emailContato2 + "&cep=" + c.cep + "&endereco=" + c.endereco + "&complemento=" + c.complemento + "&bairro=" + c.bairro + "&cidade=" + c.cidade + "&estado=" + c.estado + "&id=" + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(e) {
							console.error(e);
						}
					});
				}
			});
			db.produtos.where("s").below(2).each(function(c){
				if( c.s == 0 ) // Nova entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "produtos.php",
						dataType: "jsonp",
						crossDomain: true,
						data: 'opt=2&representada=' + c.representada + '&nome=' + c.nome + '&codigo=' + c.codigo + '&IPI=' + c.ipi + '&precoTabela=' + c.precoTabela + '&precoTabela2=' + c.precoTabela2 + '&precoTabela3=' + c.precoTabela3 + '&precoTabela4=' + c.precoTabela4,
						sucess: function(){
							console.log("Success 1");
						},
						error: function(e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 1 ) // Edição de entrada existente
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "produtos.php",
						dataType: "jsonp",
						crossDomain: true,
						data: 'opt=3&representada=' + c.representada + '&nome=' + c.nome + '&codigo=' + c.codigo + '&IPI=' + c.ipi + '&precoTabela=' + c.precoTabela + '&precoTabela2=' + c.precoTabela2 + '&precoTabela3=' + c.precoTabela3 + '&precoTabela4=' + c.precoTabela4 + '&id=' + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(e) {
							console.error(e);
						}
					});
				}
			});
		}).then(function(){
			// Dados enviados com sucesso
			// Agora receber tudo do servidor remoto
			$.ajax({ // Clientes
				type: 'GET',
				url: syncpage + "clientes.php?callback=successClients&opt=1",
				dataType: "jsonp",
				crossDomain: true,
				jsonpCallback: "successClients",
				jsonp: false,
				sucess: successClients,
				error: function(a, b, e) {
					console.log(a);
					console.log(b);
					console.error(e);
					$("#index_content").append(e);
				}
			});		
			$.ajax({ // Representadas
				type: 'GET',
				url: syncpage + "representadas.php?callback=successRepresentadas&opt=1",
				dataType: "jsonp",
				crossDomain: true,
				jsonpCallback: "successRepresentadas",
				jsonp: false,
				sucess: successRepresentadas,
				error: function(a, b, e) {
					console.log(a);
					console.log(b);
					console.error(e);
					$("#index_content").append(e);
				}
			});
			$.ajax({ // Produtos
				type: 'GET',
				url: syncpage + "produtos.php?callback=successProdutos&opt=1",
				dataType: "jsonp",
				crossDomain: true,
				jsonpCallback: "successProdutos",
				jsonp: false,
				sucess: successProdutos,
				error: function(a, b, e) {
					console.log(a);
					console.log(b);
					console.error(e);
					$("#index_content").append(e);
				}
			});
		}).catch(function(){
			$("#sinc_result").append("HOUVE UM ERRO NA INSERÇÃO DOS DADOS!!!");
			$("#sinc_result").show(1000);
		});
		
		$("#sinc_result").append("Dados sincronizados com sucesso.");
		$("#sinc_result").show(1000);
	});
	
	$("#sinc_result").click(function(){
		$("#sinc_result").hide(1000);
	});
});



/* FUNÇÕES DE CALLBACK  */

function successClients(data) {
	db.clientes.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			
			db.clientes.add({
				id: a.id,
				razaoSocial: a.razaoSocial,
				nomeFantasia: a.nomeFantasia,
				cnpj: a.CNPJ,
				inscEstadual: a.inscEstadual,
				suframa: a.suframa,
				endereco: a.endereco,
				complemento: a.complemento,
				cep: a.cep,
				bairro: a.bairro,
				cidade: a.cidade,
				estado: a.estado,
				telefone1: a.telefone1,
				telefone2: a.telefone2,
				email1: a.email1,
				email2: a.email2,
				informacoesAdicionais: a.informacoesAdicionais,
				contato1: a.contato1,
				cargoContato1: a.cargoContato1,
				telefoneContato1: a.telefoneContato1,
				emailContato1: a.emailContato1,
				contato2: a.contato2,
				cargoContato2: a.cargoContato2,
				telefoneContato2: a.telefoneContato2,
				emailContato2: a.emailContato2,
				ultimaCompra: a.ultimaCompra,
				s: 2,
			});
			$("#index_content").append("" + i + " - " + a.razaoSocial + "<br />");
		}
		
		$("#sinc_result").append("Dados sincronizados com sucesso.");
		$("#sinc_result").show(1000);
	});
	
}
function successRepresentadas(data) {
	db.representadas.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			
			db.representadas.add({
				id: a.id,
				razaoSocial: a.razaoSocial,
				nomeFantasia: a.nomeFantasia,
				cnpj: a.CNPJ,
				comissao: a.comissao,
				endereco: a.endereco,
				complemento: a.complemento,
				cep: a.cep,
				bairro: a.bairro,
				cidade: a.cidade,
				estado: a.estado,
				telefone: a.telefone,
				email: a.email,
				informacoesAdicionais: a.informacoesAdicionais,
				contato1: a.contato1,
				cargoContato1: a.cargoContato1,
				telefoneContato1: a.telefoneContato1,
				emailContato1: a.emailContato1,
				contato2: a.contato2,
				cargoContato2: a.cargoContato2,
				telefoneContato2: a.telefoneContato2,
				emailContato2: a.emailContato2,
				ultimaCompra: a.ultimaCompra,
				s: 2,
			});
			$("#index_content").append("" + i + " - " + a.razaoSocial + "<br />");
		}
	});	
}
function successProdutos(data) {
	db.produtos.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			
			db.produtos.add({
				id: a.id,
				representada: a.representada,
				nome: a.nome,
				codigo: a.codigo,
				ipi: a.ipi,
				precoTabela: a.precoTabela,
				precoTabela2: a.precoTabela2,
				precoTabela3: a.precoTabela3,
				precoTabela4: a.precoTabela4,
				s: 2,
			});
			$("#index_content").append("" + i + " - " + a.nome + "<br />");
		}
	});	
}
