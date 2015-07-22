var homepage = "http://192.168.1.8/wm/admin/conteudo/sync/"

// Criação do Banco de Dados
var db = new Dexie("WMRepresentacoes");
// s = 0 -> Não sincronizado / Criado aqui
// s = 1 -> Não sincronizado / Criado lá
// s = 2 -> Sincronizado
db.version(1).stores({
	clientes: "++idx, id, razaoSocial, nomeFantasia, cnpj, inscEstadual, suframa, endereco, complemento, cep, bairro, cidade, estado, telefone1, telefone2, fax, email1, email2, informacoesAdicionais, contato1, cargoContato1, telefoneContato1, emailContato1, contato2, cargoContato2, telefoneContato2, emailContato2, ultimaCompra, s",
	representadas: "++idx, id, razaoSocial, nomeFantasia, cnpj, comissao, telefone, email, informacoesAdicionais, contato1, cargoContato1, telefoneContato1, emailContato1, contato2, cargoContato2, telefoneContato2, emailContato2, cep, endereco, complemento, bairro, cidade, estado, s",
	produtos: "++idx, id, representada, nome, codigo, ipi, precoTabela, precoTabela2, precoTabela3, precoTabela4, s",
	listadeprodutos: "++idx, id, produto, quantidade, descontos, precoLiquido, subtotal, pedido, s",
	pedidos: "++idx, id, representada, cliente, vendedor, dataEmissao, dataFaturamento, quantidadeTotal, totalSemDescontos, semitotal, total, transportadora, condicaoDePagamento, informacoesAdicionais, status, s"
});
db.open();

function mostrarTodosOsClientes() {
	var a = '';
	db.clientes.each(function(c){
		a = a + "<div onclick='window.location.href = \"visualizar/clientes.html?id="+ c.idx +"\"' class='listagem_item'><span class='listagem_item_title'>Cliente:</span> <span class='listagem_item_val'>"+ c.nomeFantasia +"</span> - <span class='listagem_item_title'>CNPJ:</span> <span class='listagem_item_val'>"+ c.cnpj +"</span> - <i class='listagem_item_sinc_"+ c.s +"'></i></div>";
		var x = document.getElementById("listagem");
		x.innerHTML = a;
	});
}

$(document).ready(function(){
	
	$.mask.definitions['~']='[ 9]';
	$(".cnpj_field").mask("99.999.999/9999-99");
	$(".cep_field").mask("99999-999");
	$(".phone_field").mask("(99) ~9999-9999");
	$(".inscEstadual_field").mask("99999999-9");
	
	
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

	
	$("#limpa_form").click(function(){
		$(this).parent()[0].reset();
	});
	
	$("#sincronizar").click(function(){
		var f = 0;
		db.transaction("r", db.clientes, db.representadas, db.produtos, db.listadeprodutos, db.pedidos, function(){
			db.clientes.where("s").below(2).each(function(c){
				if( c.s == 0 ) // Nova entrada
				{
					$.ajax({
						type: 'GET',
						url: homepage + "clientes.php",
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
				else if( c.s == 1 )
				{
					$.ajax({
						type: 'GET',
						url: homepage + "clientes.php",
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
		}).then(function(){
			// Dados enviados com sucesso
			// Agora receber tudo
			$.ajax({
				type: 'GET',
				url: homepage + "clientes.php?callback=successClients&opt=1",
				dataType: "jsonp",
				crossDomain: true,
				jsonpCallback: "successClients",
				jsonp: false,
				sucess: successClients,
				error: function(a, b, e) {
					console.log(a);
					console.log(b);
					console.error(e);
				}
			});
		});
	});
	
	$("#sinc_result").click(function(){
		$("#sinc_result").hide(1000);
	});
});

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