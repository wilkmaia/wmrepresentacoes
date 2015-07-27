var syncpage = "http://10.46.18.39/wm/admin/conteudo/sync/"
var db;
var nProdutos = 0;
var _z = 0;
var _data = {};
var _delProd = {};

// Criação do Banco de Dados
function makeNewDatabase( name ) {
	db = new Dexie( name );
	// s = 0 -> Não sincronizado / Criado aqui
	// s = 1 -> Não sincronizado / Criado lá (possui ID)
	// s = 2 -> Sincronizado
	db.version(1).stores({
		clientes: "++idx, id, razaoSocial, nomeFantasia, cnpj, inscEstadual, suframa, endereco, complemento, cep, bairro, cidade, estado, telefone1, telefone2, fax, email1, email2, informacoesAdicionais, contato1, cargoContato1, telefoneContato1, emailContato1, contato2, cargoContato2, telefoneContato2, emailContato2, ultimaCompra, s",
		representadas: "++idx, id, razaoSocial, nomeFantasia, cnpj, comissao, telefone, email, informacoesAdicionais, contato1, cargoContato1, telefoneContato1, emailContato1, contato2, cargoContato2, telefoneContato2, emailContato2, cep, endereco, complemento, bairro, cidade, estado, s",
		produtos: "++idx, id, representada, nome, codigo, ipi, precoTabela, precoTabela2, precoTabela3, precoTabela4, s",
		listadeprodutos: "++idx, id, produto, quantidade, descontos, precoLiquido, subtotal, pedido, hash, s",
		pedidos: "++idx, id, representada, cliente, vendedor, dataEmissao, dataFaturamento, quantidadeTotal, totalSemDescontos, semitotal, total, transportadora, condicaoDePagamento, informacoesAdicionais, status, hash, s",
		vendedores: "++idx, id, nome",
	});
	db.open();
}
makeNewDatabase( "WMRepresentacoes" );

/* FUNÇÕES GERAIS */

function myParseFloat( n ) {
	if( !isNaN( n ) )
		return parseFloat(n);
	
	if( n == undefined )
		return 0;
	
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
function getRandomToken() {
	a = Math.random().toString(36).substr(2);
	b = Math.random().toString(36).substr(2);
	return a + b;
}



/* FUNÇÕES DE LISTAGEM */

function mostrarTodosOsClientes() {
	var a = '';
	db.clientes.each(function(c){
		if( c.s == 3 )
			return;
		
		a = a + '<div class="clientes_listagem" id="cliente-'+ c.id +'"><a class="clientes_listagem-fantasia" href="visualizar/clientes.html?&idx='+ c.idx +'"><span class="clientes_listagem-fantasia">'+ c.nomeFantasia +'</span></a> <span class="clientes_listagem-razao">- '+ c.razaoSocial +' - '+ c.cnpj +'</span><button onclick="document.location = \'editar/clientes.html?idx='+ c.idx +'\';" class="clientes_listagem_editar" id="clientes_editar-'+ c.id +'">Editar Cliente</button><div class="clientes_listagem_div_interna clientes_listagem_'+ c.s +'"><div class="clientes_listagem_div_interna_fone">'+ c.telefone1 +'</div><div class="clientes_listagem_div_interna_mail"><a href="mailto:'+ c.email1 +'" target="_blank">'+ c.email1 +'</a></div></div></div>';
		var x = document.getElementById("listagem");
		x.innerHTML = a;
	});
}
function mostrarTodasAsRepresentadas() {
	var a = '';
	db.representadas.each(function(c){
		if( c.s == 3 )
			return;
		
		a = a + '<div class="clientes_listagem" id="representada-'+ c.id +'"><a class="clientes_listagem-fantasia" href="visualizar/representadas.html?&idx='+ c.idx +'"><span class="clientes_listagem-fantasia">'+ c.nomeFantasia +'</span></a> <span class="clientes_listagem-razao">- '+ c.razaoSocial +' - '+ c.cnpj +'</span><button class="clientes_listagem_editar" id="representadas_editar-'+ c.id +'" onclick="document.location = \'editar/representadas.html?idx='+ c.idx +'\';">Editar Representada</button><div class="clientes_listagem_div_interna clientes_listagem_'+ c.s +'"><div class="clientes_listagem_div_interna_fone">'+ c.telefone +'</div><div class="clientes_listagem_div_interna_mail"><a href="mailto:'+ c.email +'" target="_blank">'+ c.email +'</a></div></div></div>';
		var x = document.getElementById("listagem");
		x.innerHTML = a;
	});
}
function mostrarTodosOsProdutos() {
	var a = '';
	db.produtos.each(function(c){
		if( c.s == 3 )
			return;
		
		db.representadas.where('id').equals(c.representada).each(function(r){
			p = 'R$ '+ pointToCommaSeparator(c.precoTabela);
			if( c.precoTabela2 )
				p = p + ' / R$ ' + pointToCommaSeparator(c.precoTabela2);
			if( c.precoTabela3 )
				p = p + ' / R$ ' + pointToCommaSeparator(c.precoTabela3);
			if( c.precoTabela4 )
				p = p + ' / R$ ' + pointToCommaSeparator(c.precoTabela4);
			
			a = a + '<div class="clientes_listagem" id="produto-'+ c.id +'"><div class="produtos_listagem_imagem"><img class="produtos_listagem_imagem_img" src="images/produtos/default.png" /></div><div class="produtos_listagem_conteudo"><a class="clientes_listagem-fantasia" href="visualizar/produtos.html?&idx='+ c.idx +'"><span>'+ c.nome +'</span></a> <span class="clientes_listagem-razao">- '+ r.nomeFantasia +'</span><div class="clientes_listagem_div_interna clientes_listagem_'+ c.s +'"><div class="clientes_listagem_div_interna_fone">Preço de Tabela: '+ p +'</div><div class="clientes_listagem_div_interna_mail">IPI: '+ pointToCommaSeparator(c.ipi) +'%</div></div></div><div><button class="clientes_listagem_editar" onclick="document.location = \'editar/produtos.html?idx='+ c.idx +'\';" id="produtos_editar-'+ c.id +'">Editar Produto</button></div></div>';
			
			var x = document.getElementById("listagem");
			x.innerHTML = a;
		});
	});
}
function mostrarTodosOsPedidos() {
	var a = '';
	db.pedidos.each(function(p){
		if( p.s == 3 )
			return;
		
		db.representadas.where('id').equals(p.representada).each(function(r){
			db.clientes.where('id').equals(p.cliente).each(function(c){
				db.vendedores.where('id').equals(p.vendedor).each(function(v){
					a = a + '<div class="clientes_listagem" id="cliente-'+ p.id +'">        <a class="clientes_listagem-fantasia" href="visualizar/produtos.html?&idx='+ p.idx +'"><span class="clientes_listagem-fantasia">Pedido #'+ p.id +'</span></a> <span class="clientes_listagem-razao">- emitido por <strong>'+ v.nome +'</strong></span>        <button onclick="document.location = \'editar/pedidos.html?idx='+ p.idx +'\';" class="clientes_listagem_editar" id="pedidos_editar-'+ p.id +'">Editar Pedido</button>        <div class="clientes_listagem_div_interna clientes_listagem_'+ p.s +'">			<div class="pedidos_listagem_helper pedidos_listagem_helper_1">				<div class="clientes_listagem_div_interna_fone"><strong>Representada:</strong> '+ r.nomeFantasia +'</div>				<div class="clientes_listagem_div_interna_mail"><strong>Cliente:</strong> '+ c.nomeFantasia +'</div>			</div>			<div class="pedidos_listagem_helper pedidos_listagem_helper_2">				<div class="clientes_listagem_div_interna_fone"><strong>Total:</strong> R$ '+ pointToCommaSeparator(p.total) +'</div>				<div class="clientes_listagem_div_interna_mail"><strong>Pagamento:</strong> '+ p.condicaoDePagamento +'</div>			</div>        </div>    </div>';
					var x = document.getElementById("listagem");
					x.innerHTML = a;
				});
			});
		});
	});
}
function fillRepresentadas(id) {
	var a = '<option value="0">----------</option>';
	db.representadas.each(function(c){
		if( c.id == 0 || c.s == 3 )
			return;
		
		a = a + "<option value='"+ c.id +"'>"+ c.nomeFantasia +"</option>";
		x = document.getElementById(id);
		x.innerHTML = a;
	});
}
function fillClientes(id) {
	var a = '<option value="0">-----------</option>';
	db.clientes.each(function(c){
		if( c.id == 0 || c.s == 3 )
			return;
		
		a = a + "<option value='"+ c.id +"'>"+ c.nomeFantasia +"</option>";
		x = document.getElementById(id);
		x.innerHTML = a;
	});
}
function fillProdutos(rep_dom_id, id) {
	var a = '<option value="0">---------</option>';
	var rep = document.getElementById(rep_dom_id);
	rep = rep.options[rep.selectedIndex].value;
	
	if( nProdutos > 0 && _z == 0 )
	{
		x = confirm("A lista de produtos não está vazia. A mudança de representada esvaziará a lista de produtos. Tem certeza que deseja continuar?");
		
		if( x == false )
			return;
	}
	
	if( _z == 0 )
	{
		nProdutos = 0;
		x = document.getElementById("cldp_list_items");
		x.innerHTML = "";
	}
		
	x = document.getElementById(id);
	if( rep == 0 )
		x.innerHTML = a;
	

	db.produtos.where("representada").equals(rep).each(function(c){
		if( c.id == 0 || c.s == 3 )
			return;
		
		a = a + "<option value='"+ c.id +"'>"+ c.nome +"</option>";
		x.innerHTML = a;
	});
	
	if( _z != 0 )
		_z = 0;
}
function addProductOrderLine() {
	var _s = document.getElementById("produtos");
	var prod = _s.options[_s.selectedIndex].value;
	_s.selectedIndex = 0;
	
	if( $("#cldp_item-" + prod).length != 0 )
		return;
	
	db.produtos.where("id").equals(prod).each(function(data){
		a = '<div class="cldp_item" id="cldp_item-'+ data.id +'"><div class="cldp_produto">'+ (data.codigo ? data.codigo : '------') +'</div><div class="cldp_produto cldp_desc_2">'+ (data.nome ? data.nome : 'Descrição não disponível') +'</div><div class="cldp_produto"><input type="number" name="quantidade'+ data.id +'" id="cldp_quantidade-'+ data.id +'" class="cldp_input" value="1" min="1" required /></div><div class="cldp_produto"><select id="cldp_preco_tabela-'+ data.id +'"><option value="'+data.precoTabela+'">R$ '+ pointToCommaSeparator(data.precoTabela) +'</option>'+ (data.precoTabela2 ? '<option value="'+data.precoTabela2+'">R$ '+ pointToCommaSeparator(data.precoTabela2) +'</option value="'+data.precoTabela3+'">' : '') +''+ (data.precoTabela3 ? '<option>R$ '+ pointToCommaSeparator(data.precoTabela3) +'</option>' : '') +''+ (data.precoTabela4 ? '<option value="'+data.precoTabela4+'">R$ '+ pointToCommaSeparator(data.precoTabela4) +'</option>' : '') +'</select></div><div class="cldp_produto"><input type="text" name="desconto'+ data.id +'" id="cldp_desconto-'+ data.id +'" class="cldp_input cadastrar_input_percentage" value="0,00%" required /></div><div class="cldp_produto" id="cldp_precoLiquido-'+ data.id +'">R$ '+ pointToCommaSeparator(data.precoTabela) +'</div><div class="cldp_produto" id="cldp_ipi-'+ data.id +'">'+ pointToCommaSeparator(data.ipi) +'%</div><div class="cldp_produto" id="cldp_subtotal-'+ data.id +'">R$ '+ pointToCommaSeparator(data.precoTabela * (1 + data.ipi / 100)) +'</div><div class="cldp_delete" id="cldp_delete-'+ data.id +'">Deletar</div></div>';

		$("#cldp_list_items").append(a);
		
		// Event listeners
		$(".cldp_delete").click(function(){
			obj = $(this).parent();
			obj.remove();
			--nProdutos;
			
			updateDynamicInfo();
		});
		$(".cadastrar_input_percentage").change(function(){
			obj = $(this);
			n = parseFloat(commaToPointSeparator(obj.val()));
			if( n < 0 )
				n = 0;
			else if( n > 100 )
				n = 100;
			
			obj.val(pointToCommaSeparator(n) + "%");
		});
		$("#cldp_preco_tabela-" + data.id).change(function(){
			id = parseInt(this.id.split('-')[1]);
			updateThisInfo(id);
		});
		$("#cldp_quantidade-" + data.id).change(function(){
			id = parseInt(this.id.split('-')[1]);
			updateThisInfo(id);
		});
		$("#cldp_desconto-" + data.id).change(function(){
			id = parseInt(this.id.split('-')[1]);
			updateThisInfo(id);
		});
		
		++nProdutos;
		updateDynamicInfo();
	});
}
function updateThisInfo( _id ) {
	precoTab = $("#cldp_preco_tabela-" + _id).val();
	descontos = myParseFloat($("#cldp_desconto-" + _id).val());
	ipi = myParseFloat($("#cldp_ipi-" + _id).html());
	qte = myParseFloat($("#cldp_quantidade-" + _id).val());
	
	precoLiq = qte * precoTab * (1 - descontos/100);
	subtotal = precoLiq * (1 + ipi/100);
	
	$("#cldp_precoLiquido-" + _id).html("R$ " + pointToCommaSeparator(precoLiq));
	$("#cldp_subtotal-" + _id).html("R$ " + pointToCommaSeparator(subtotal));
	
	updateDynamicInfo();
}
function updateDynamicInfo() {
	children = $("#cldp_list_items").children(".cldp_item");
	
	qte = 0;
	totalSem = 0;
	semi = 0;
	total = 0;
	id = 0;
	
	for( j = 0; x = children[j]; ++j )
	{
		if( x.style.display == "none" )
			continue;
		
		_id = parseInt(x.id.split('-')[1]);
		
		cur_qte = parseInt($("#cldp_quantidade-" + _id).val());
		qte += cur_qte;
		totalSem += cur_qte * $("#cldp_preco_tabela-" + _id).val();
		semi += myParseFloat($("#cldp_precoLiquido-" + _id).html());
		total += myParseFloat($("#cldp_subtotal-" + _id).html());
	}
	
	descontoGeral = (totalSem - semi) / totalSem * 100;
	descontoGeral2 = (totalSem - total) / totalSem * 100;
	
	$("#cadastrar_tip-totalSemDescontos").html('Desconto geral: ' + pointToCommaSeparator(descontoGeral) + '%');
	$("#cldp_desconto_geral_sem_ipi").html('Desconto geral (sem IPI): <span>' + pointToCommaSeparator(descontoGeral) + '</span>%');
	$("#cldp_desconto_geral_ipi").html('Desconto geral (com IPI): <span>' + pointToCommaSeparator(descontoGeral2) + '</span>%');
	
	$("#quantidadeTotal").val(qte);
	$("#totalSemDescontos").val("R$ " + pointToCommaSeparator(totalSem));
	$("#semiTotal").val("R$ " + pointToCommaSeparator(semi));
	$("#total").val("R$ " + pointToCommaSeparator(total));
}


/* PREPARAÇÃO INICIAL DA PÁGINA */

$(document).ready(function(){
	
	fillRepresentadas("representada");
	fillClientes("cliente");
	
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
	

	
	$("#cadastrar_form-clientes").submit(function(e){
		e.preventDefault();
		
		if( _data["idx"] != undefined )
		{
			db.clientes.update(parseInt(_data["idx"]), 
			{
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
				s: 1,
			}).then(function(){
				document.location = "../clientes.html";
			});
		}
		else
		{
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
				document.location = "../clientes.html";
			});
		}
	});
	$("#cadastrar_form-representadas").submit(function(e){
		e.preventDefault();
		
		if( _data["idx"] != undefined )
		{
			db.representadas.update(parseInt(_data["idx"]), 
			{
				razaoSocial: $("#razaoSocial").val(),
				nomeFantasia: $("#nomeFantasia").val(),
				cnpj: $("#cnpj").val(),
				comissao: myParseFloat($("#comissao").val()),
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
				s: 1,
			}).then(function(){
				document.location = "../representadas.html";
			});
		}
		else
		{
			db.representadas.add({
				id: 0,
				razaoSocial: $("#razaoSocial").val(),
				nomeFantasia: $("#nomeFantasia").val(),
				cnpj: $("#cnpj").val(),
				comissao: myParseFloat($("#comissao").val()),
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
				document.location = "../representadas.html";
			});
		}
	});
	$("#cadastrar_form-produtos").submit(function(e){
		e.preventDefault();
		
		if( _data["idx"] != undefined )
		{
			db.produtos.update(parseInt(_data["idx"]),
			{
				representada: $("#representada").val(),
				nome: $("#nome").val(),
				codigo: $("#codigo").val(),
				ipi: myParseFloat($("#IPI").val()),
				precoTabela: myParseFloat($("#precoTabela").val()),
				precoTabela2: myParseFloat($("#precoTabela2").val()),
				precoTabela3: myParseFloat($("#precoTabela3").val()),
				precoTabela4: myParseFloat($("#precoTabela4").val()),
				s: 1,
			}).then(function(){
				document.location = "../produtos.html";
			});
		}
		else
		{
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
				document.location = "../produtos.html";
			});
		}
	});
	$("#cadastrar_form-pedidos").submit(function(e){
		e.preventDefault();
		
		randomToken = getRandomToken();
		
		if( _data["idx"] != undefined )
		{
			_delProd.forEach(function(c){
				db.listadeprodutos.delete(parseInt(c));
				$('[name="lp-'+ c +'"]').remove();
			});
			
			db.transaction("rw", db.pedidos, db.listadeprodutos, function(){
				db.pedidos.update(parseInt(_data["idx"]),
				{
					representada: $("#representada").val(),
					cliente: $("#cliente").val(),
					dataEmissao: $("#dataEmissao").val(),
					dataFaturamento: $("#dataFaturamento").val(),
					quantidadeTotal: $("#quantidadeTotal").val(),
					totalSemDescontos: myParseFloat($("#totalSemDescontos").val()),
					semitotal: myParseFloat($("#semiTotal").val()),
					total: myParseFloat($("#total").val()),
					transportadora: $("#transportadora").val(),
					condicaoDePagamento: $("#condicaoDePagamento").val(),
					informacoesAdicionais: $("#informacoesAdicionais").val(),
					status: $("#status").val(),
					hash: randomToken,
					s: 1,
				});
				
				var _N = 0;
				children = $("#cldp_list_items").children(".cldp_item");
				db.listadeprodutos.count(function(c){
					_N = c;
				}).then(function(){
					for( j = 0; x = children[j]; ++j )
					{
						_id = parseInt(x.id.split('-')[1]);
						qte = parseInt($("#cldp_quantidade-" + _id).val());
						descontos = myParseFloat($("#cldp_desconto-" + _id).val());
						precoLiquido = myParseFloat($("#cldp_precoLiquido-" + _id).html());
						subtotal = myParseFloat($("#cldp_subtotal-" + _id).html());
						
						if( _data[_id] != undefined )
						{
							db.listadeprodutos.update(_data[_id]["idx"],
							{
								quantidade: qte,
								descontos: descontos,
								precoLiquido: precoLiquido,
								subtotal: subtotal,
								hash: randomToken,
								s: 1,
							});
						}
						else
						{
							db.listadeprodutos.add({
								idx: _N++,
								id: 0,
								produto: _id,
								quantidade: qte,
								descontos: descontos,
								precoLiquido: precoLiquido,
								subtotal: subtotal,
								pedido: _data["id"],
								hash: randomToken,
								s: 0,
							});
						}
					}
				});
			}).then(function(){
				document.location = "../pedidos.html";
			});
		}
		else
		{
			db.transaction("rw", db.pedidos, db.listadeprodutos, function(){
				db.pedidos.add({
					id: 0,
					representada: $("#representada").val(),
					cliente: $("#cliente").val(),
					dataEmissao: $("#dataEmissao").val(),
					dataFaturamento: $("#dataFaturamento").val(),
					quantidadeTotal: $("#quantidadeTotal").val(),
					totalSemDescontos: myParseFloat($("#totalSemDescontos").val()),
					semitotal: myParseFloat($("#semiTotal").val()),
					total: myParseFloat($("#total").val()),
					transportadora: $("#transportadora").val(),
					condicaoDePagamento: $("#condicaoDePagamento").val(),
					informacoesAdicionais: $("#informacoesAdicionais").val(),
					status: $("#status").val(),
					hash: randomToken,
					s: 0,
				});
				
				children = $("#cldp_list_items").children(".cldp_item");
				for( j = 0; x = children[j]; ++j )
				{
					_id = parseInt(x.id.split('-')[1]);
					qte = parseInt($("#cldp_quantidade-" + _id).val());
					descontos = myParseFloat($("#cldp_desconto-" + _id).val());
					precoLiquido = myParseFloat($("#cldp_precoLiquido-" + _id).html());
					subtotal = myParseFloat($("#cldp_subtotal-" + _id).html());
					
					db.listadeprodutos.add({
						id: 0,
						produto: _id,
						quantidade: qte,
						descontos: descontos,
						precoLiquido: precoLiquido,
						subtotal: subtotal,
						pedido: 0,
						hash: randomToken,
						s: 0,
					});
				}
			}).then(function(){
				document.location = "../pedidos.html";
			});
		}
	});
	
	
	
	$("#cadastrar_cancel").click(function(){
		$(this).parent().parent()[0].reset();
	});
	
	$(".cadastrar_toggle").click(function(){
		$(".cadastrar_toggle").toggle();
		$("#cadastrar_completo").toggle(400);
	});
	
	$("#sincronizar").click(function(){
		db.transaction("r", db.clientes, db.representadas, db.produtos, db.listadeprodutos, db.pedidos, function(){
			db.clientes.where("s").anyOf([0, 1, 3]).each(function(c){
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
						error: function(a, b, e) {
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
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 3 ) // Deleção de entrada
				{
					console.log(c.nomeFantasia);
					$.ajax({
						type: 'GET',
						url: syncpage + "clientes.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=4&id=" + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(a, b, e) {
							console.error(e);
						}
					});
					console.log(c.nomeFantasia);
				}
			});
			db.representadas.where("s").anyOf([0, 1, 3]).each(function(c){
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
						error: function(a, b, e) {
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
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 3 ) // Deleção de entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "representadas.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=4&id=" + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
			});
			db.produtos.where("s").anyOf([0, 1, 3]).each(function(c){
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
						error: function(a, b, e) {
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
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 3 ) // Deleção de entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "produtos.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=4&id=" + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
			});
			db.pedidos.where("s").anyOf([0, 1, 3]).each(function(c){
				if( c.s == 0 ) // Nova entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "pedidos.php",
						dataType: "jsonp",
						crossDomain: true,
						data: 'opt=2&representada=' + c.representada + '&vendedor=1&cliente=' + c.cliente + '&dataEmissao=' + c.dataEmissao + '&dataFaturamento=' + c.dataFaturamento + '&quantidadeTotal=' + c.quantidadeTotal + '&totalSemDescontos=' + c.totalSemDescontos + '&semiTotal=' + c.semitotal + '&total=' + c.total + '&transportadora=' + c.transportadora + '&condicaoDePagamento=' + c.condicaoDePagamento + '&informacoesAdicionais=' + c.informacoesAdicionais + '&status=' + c.status + '&hash=' + c.hash,
						sucess: function(){
							console.log("Success 1");
						},
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 1 ) // Edição de entrada existente
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "pedidos.php",
						dataType: "jsonp",
						crossDomain: true,
						data: 'opt=3&representada=' + c.representada + '&vendedor=1&cliente=' + c.cliente + '&dataEmissao=' + c.dataEmissao + '&dataFaturamento=' + c.dataFaturamento + '&quantidadeTotal=' + c.quantidadeTotal + '&totalSemDescontos=' + c.totalSemDescontos + '&semiTotal=' + c.semitotal + '&total=' + c.total + '&transportadora=' + c.transportadora + '&condicaoDePagamento=' + c.condicaoDePagamento + '&informacoesAdicionais=' + c.informacoesAdicionais + '&status=' + c.status + '&id=' + c.id + '&hash=' + c.hash,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
				else if( c.s == 3 ) // Deleção de entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "pedido.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=4&id=" + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(a, b, e) {
							console.error(e);
						}
					});
				}
			});
			db.listadeprodutos.where("s").anyOf([0, 1, 3]).each(function(c){
			if( c.s == 0 ) // Nova entrada
			{
				$.ajax({
					type: 'GET',
					url: syncpage + "listadeprodutos.php",
					dataType: "jsonp",
					crossDomain: true,
					data: 'opt=2&produto=' + c.produto + '&quantidade=' + c.quantidade + '&descontos=' + c.descontos + '&precoLiquido=' + c.precoLiquido + '&subtotal=' + c.subtotal + '&pedido=' + c.pedido + '&hash=' + c.hash,
					sucess: function(){
						console.log("Success 1");
					},
					error: function(a, b, e) {
						console.error(e);
					}
				});
			}
			else if( c.s == 1 ) // Edição de entrada existente
			{
				$.ajax({
					type: 'GET',
					url: syncpage + "listadeprodutos.php",
					dataType: "jsonp",
					crossDomain: true,
					data: 'opt=3&produto=' + c.produto + '&quantidade=' + c.quantidade + '&descontos=' + c.descontos + '&precoLiquido=' + c.precoLiquido + '&subtotal=' + c.subtotal + '&pedido=' + c.pedido + '&id=' + c.id + '&hash=' + c.hash,
					sucess: function(){
						console.log("Success 2");
					},
					error: function(a, b, e) {
						console.error(e);
					}
				});
			}
			else if( c.s == 3 ) // Deleção de entrada
				{
					$.ajax({
						type: 'GET',
						url: syncpage + "listadeprodutos.php",
						dataType: "jsonp",
						crossDomain: true,
						data: "opt=4&id=" + c.id,
						sucess: function(){
							console.log("Success 2");
						},
						error: function(a, b, e) {
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
			$.ajax({ // ListaDeProdutos
				type: 'GET',
				url: syncpage + "listadeprodutos.php?callback=successListaDeProdutos&opt=1",
				dataType: "jsonp",
				crossDomain: true,
				jsonpCallback: "successListaDeProdutos",
				jsonp: false,
				sucess: successListaDeProdutos,
				error: function(a, b, e) {
					console.log(a);
					console.log(b);
					console.error(e);
					$("#index_content").append(e);
				}
			});
			$.ajax({ // ListaDeProdutos
				type: 'GET',
				url: syncpage + "pedidos.php?callback=successPedidos&opt=1",
				dataType: "jsonp",
				crossDomain: true,
				jsonpCallback: "successPedidos",
				jsonp: false,
				sucess: successPedidos,
				error: function(a, b, e) {
					console.log(a);
					console.log(b);
					console.error(e);
					$("#index_content").append(e);
				}
			});
			$.ajax({ // Vendedores
				type: 'GET',
				url: syncpage + "vendedores.php?callback=successVendedores&opt=1",
				dataType: "jsonp",
				crossDomain: true,
				jsonpCallback: "successVendedores",
				jsonp: false,
				sucess: successVendedores,
				error: function(a, b, e) {
					console.log(a);
					console.log(b);
					console.error(e);
					$("#index_content").append(e);
				}
			});
		}).catch(function(e){
			$("#sinc_result").html("HOUVE UM ERRO NA INSERÇÃO DOS DADOS!!!");
			console.error(e);
			$("#sinc_result").show(1000);
		}).finally(function(){ // Atualiza lista de produtos baseado nos IDs dos pedidos
			window.setTimeout(function(){
				db.pedidos.each(function(p){
					if( p.hash == "" )
						return;
					
					db.listadeprodutos.where("pedido").equals("0").each(function(c){
						if( c.hash != p.hash )
							return;
						
						c.pedido = p.id;
						$.ajax({ // Atualiza Lista De Produtos
							type: 'GET',
							url: syncpage + "listadeprodutos.php",
							dataType: "jsonp",
							crossDomain: true,
							data: 'opt=3&produto=' + c.produto + '&quantidade=' + c.quantidade + '&descontos=' + c.descontos + '&precoLiquido=' + c.precoLiquido + '&subtotal=' + c.subtotal + '&pedido=' + c.pedido + '&id=' + c.id + '&hash=' + c.hash,
							sucess: function(){
								console.log("Success 2");
							},
							error: function(a, b, e) {
								console.error(e);
							}
						});
					});
				});
			}, 1000);
		});
		
		$("#sinc_result").html("Dados sincronizados com sucesso.");
		$("#sinc_result").show(400);
	});
	
	$("#sinc_result").click(function(){
		$("#sinc_result").hide(400);
	});

	
	// Get page query string
	//page = document.location.split('/');
	var page;
	var act;
	var query_str;
	
	// Android
	if ( (navigator.userAgent.indexOf('Android') != -1) ) {
		pathname = document.location.pathname.split('/');
		page = pathname[pathname.length - 1];
		act = pathname[pathname.length - 2];
		query_str = document.location.search.split('?')[1];
	}
	else
	{
		fullpage = window.location.href.split('?')[0].split('/');
		page = fullpage[fullpage.length - 1];
		act = fullpage[fullpage.length - 2];
		query_str = window.location.href.split('?')[1];
	}
	
	/*
	// iPhone / iPod
	if(navigator.userAgent.match(/iPhone|iPod/i))
		window.location.replace("your iPhone HTML file.html");
	if(navigator.userAgent.match(/iPad/i))
		window.location.replace("your iPad HTML file.html");
	}
	*/
	
	if( query_str != "" && query_str != undefined )
	{
		query_str = query_str.split('&');
		for( i = 0; i < query_str.length; ++i )
			_data[query_str[i].split('=')[0]] = query_str[i].split('=')[1];
	}
	
	if( act == "editar" )
	{
		if( _data['idx'] == undefined )
			document.location = '../'+ page;
		
		_delProd = {};
		
		switch( page )
		{
			case 'clientes.html':
				db.clientes.where('idx').equals(parseInt(_data['idx'])).each(function(c){
					$("#razaoSocial").val( c.razaoSocial );
					$("#nomeFantasia").val( c.nomeFantasia );
					$("#cnpj").val( c.cnpj );
					$("#inscEstadual").val( c.inscEstadual );
					$("#suframa").val( c.suframa );
					$("#endereco").val( c.endereco );
					$("#complemento").val( c.complemento );
					$("#cep").val( c.cep );
					$("#bairro").val( c.bairro );
					$("#cidade").val( c.cidade );
					$("#estado").val( c.estado );
					$("#telefone1").val( c.telefone1 );
					$("#telefone2").val( c.telefone2 );
					$("#email1").val( c.email1 );
					$("#email2").val( c.email2 );
					$("#informacoesAdicionais").val( c.informacoesAdicionais );
					$("#contato1").val( c.contato1 );
					$("#cargoContato1").val( c.cargoContato1 );
					$("#telefoneContato1").val( c.telefoneContato1 );
					$("#emailContato1").val( c.emailContato1 );
					$("#contato2").val( c.contato2 );
					$("#cargoContato2").val( c.cargoContato2 );
					$("#telefoneContato2").val( c.telefoneContato2 );
					$("#emailContato2").val( c.emailContato2 );
					$("#ultimaCompra").val( c.ultimaCompra );
				});
				break;
				
			case 'pedidos.html':
				_delProd = [];
				db.pedidos.where("idx").equals(parseInt(_data["idx"])).each(function(c){
					// Gambiarra devido a um "rush"
					// Sem isso as boxes ficam com a seleção padrão, ao invés do esperado
					window.setTimeout(function(){
						$("#representada").val( c.representada );
						$("#cliente").val( c.cliente );
						_z = 1;
						fillProdutos('representada', 'produtos');
					}, 100);
					
					d = c.dataEmissao.split(" ")[0];
					$("#dataEmissao").val( d );
					
					d = c.dataFaturamento.split(" ")[0];
					if( d == "0000-00-00" )
						d = undefined;
					
					$("#dataFaturamento").val( d );
					$("#quantidadeTotal").val( c.quantidadeTotal );
					$("#totalSemDescontos").val( "R$ "+ pointToCommaSeparator( c.totalSemDescontos ) );
					$("#semiTotal").val( "R$ "+ pointToCommaSeparator( c.semitotal ) );
					$("#total").val( "R$ "+ pointToCommaSeparator( c.total ) );
					$("#transportadora").val( c.transportadora );
					$("#condicaoDePagamento").val( c.condicaoDePagamento );
					$("#informacoesAdicionais").val( c.informacoesAdicionais );
					$("#status").val( c.status );
					
					_data["id"] = c.id;
					db.listadeprodutos.where("pedido").equals(c.id).each(function(lp){
						if( lp.s == 3 )
							return;
						
						nProdutos++;
						db.produtos.where("id").equals(""+ lp.produto).each(function(data){
							
							_data[data.id] = { "idx": lp.idx };
							
							a = '<div class="cldp_item" id="cldp_item-'+ data.id +'" name="lp-'+ lp.idx +'"><div class="cldp_produto">'+ (data.codigo ? data.codigo : '------') +'</div><div class="cldp_produto cldp_desc_2">'+ (data.nome ? data.nome : 'Descrição não disponível') +'</div><div class="cldp_produto"><input type="number" name="quantidade'+ data.id +'" id="cldp_quantidade-'+ data.id +'" class="cldp_input" value="'+ lp.quantidade +'" min="1" required /></div><div class="cldp_produto"><select id="cldp_preco_tabela-'+ data.id +'"><option value="'+data.precoTabela+'">R$ '+ pointToCommaSeparator(data.precoTabela) +'</option>'+ (data.precoTabela2 ? '<option value="'+data.precoTabela2+'">R$ '+ pointToCommaSeparator(data.precoTabela2) +'</option value="'+data.precoTabela3+'">' : '') +''+ (data.precoTabela3 ? '<option>R$ '+ pointToCommaSeparator(data.precoTabela3) +'</option>' : '') +''+ (data.precoTabela4 ? '<option value="'+data.precoTabela4+'">R$ '+ pointToCommaSeparator(data.precoTabela4) +'</option>' : '') +'</select></div><div class="cldp_produto"><input type="text" name="desconto'+ data.id +'" id="cldp_desconto-'+ data.id +'" class="cldp_input cadastrar_input_percentage" value="'+ pointToCommaSeparator(lp.descontos) +'%" required /></div><div class="cldp_produto" id="cldp_precoLiquido-'+ data.id +'">R$ '+ pointToCommaSeparator(lp.precoLiquido) +'</div><div class="cldp_produto" id="cldp_ipi-'+ data.id +'">'+ pointToCommaSeparator(data.ipi) +'%</div><div class="cldp_produto" id="cldp_subtotal-'+ data.id +'">R$ '+ pointToCommaSeparator(lp.subtotal) +'</div><div class="cldp_delete" id="cldp_delete-'+ data.id +'">Deletar</div></div>';
							
							$("#cldp_list_items").append(a);
							
							$(".cldp_delete").click(function(){
								obj = $(this).parent();
								
								_lp = obj.attr("name").split('-')[1];
								
								delete _data[obj.attr("id").split('-')[1]];
								
								_delProd.push( _lp );
								
								obj.css("display", "none");
								--nProdutos;
								updateDynamicInfo();
							});		
							$(".cadastrar_input_percentage").change(function(){
								obj = $(this);
								n = parseFloat(commaToPointSeparator(obj.val()));
								if( n < 0 )
									n = 0;
								else if( n > 100 )
									n = 100;
								
								obj.val(pointToCommaSeparator(n) + "%");
							});
							$("#cldp_preco_tabela-" + data.id).change(function(){
								id = parseInt(this.id.split('-')[1]);
								updateThisInfo(id);
							});
							$("#cldp_quantidade-" + data.id).change(function(){
								id = parseInt(this.id.split('-')[1]);
								updateThisInfo(id);
							});
							$("#cldp_desconto-" + data.id).change(function(){
								id = parseInt(this.id.split('-')[1]);
								updateThisInfo(id);
							});
						});
					});
				});
				break;
				
			case 'produtos.html':
				db.produtos.where('idx').equals(parseInt(_data['idx'])).each(function(c){
					// Gambiarra devido a um "rush"
					// Sem isso as boxes ficam com a seleção padrão, ao invés do esperado
					window.setTimeout(function(){
						$("#representada").val( c.representada );
					}, 100);
					
					$("#nome").val( c.nome );
					$("#codigo").val( c.codigo );
					$("#IPI").val( pointToCommaSeparator(c.ipi) + '%' );
					$("#precoTabela").val( "R$ "+ pointToCommaSeparator(c.precoTabela) );
					$("#precoTabela2").val( "R$ "+ pointToCommaSeparator(c.precoTabela2) );
					$("#precoTabela3").val( "R$ "+ pointToCommaSeparator(c.precoTabela3) );
					$("#precoTabela4").val( "R$ "+ pointToCommaSeparator(c.precoTabela4) );
				});
				break;
				
			case 'representadas.html':
				db.representadas.where('idx').equals(parseInt(_data['idx'])).each(function(c){
					$("#razaoSocial").val( c.razaoSocial );
					$("#nomeFantasia").val( c.nomeFantasia );
					$("#cnpj").val( c.cnpj );
					$("#comissao").val( pointToCommaSeparator(c.comissao) + '%' );
					$("#endereco").val( c.endereco );
					$("#complemento").val( c.complemento );
					$("#cep").val( c.cep );
					$("#bairro").val( c.bairro );
					$("#cidade").val( c.cidade );
					$("#estado").val( c.estado );
					$("#telefone").val( c.telefone );
					$("#email").val( c.email );
					$("#informacoesAdicionais").val( c.informacoesAdicionais );
					$("#contato1").val( c.contato1 );
					$("#cargoContato1").val( c.cargoContato1 );
					$("#telefoneContato1").val( c.telefoneContato1 );
					$("#emailContato1").val( c.emailContato1 );
					$("#contato2").val( c.contato2 );
					$("#cargoContato2").val( c.cargoContato2 );
					$("#telefoneContato2").val( c.telefoneContato2 );
					$("#emailContato2").val( c.emailContato2 );
				});
				break;
		}
	}
});



/* FUNÇÕES DE CALLBACK  */

function successClients(data) {
	db.clientes.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			
			db.clientes.put({
				idx: i,
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
		}
	});
}
function successRepresentadas(data) {
	db.representadas.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			
			db.representadas.put({
				idx: i,
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
		}
	});
}
function successProdutos(data) {
	db.produtos.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			
			db.produtos.put({
				idx: i,
				id: a.id,
				representada: a.representada,
				nome: a.nome,
				codigo: a.codigo,
				ipi: a.IPI,
				precoTabela: a.precoTabela,
				precoTabela2: a.precoTabela2,
				precoTabela3: a.precoTabela3,
				precoTabela4: a.precoTabela4,
				s: 2,
			});
		}
	});
}
function successListaDeProdutos(data) {
	db.listadeprodutos.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			db.listadeprodutos.put({
				idx: i,
				id: a.id,
				produto: a.produto,
				quantidade: a.quantidade,
				descontos: a.descontos,
				precoLiquido: a.precoLiquido,
				subtotal: a.subtotal,
				pedido: a.pedido,
				hash: a.hash,
				s: 2,
			});
		}
	});
}
function successPedidos(data) {
	db.pedidos.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			db.pedidos.put({
				idx: i,
				id: a.id,
				representada: a.representada,
				vendedor: a.vendedor,
				cliente: a.cliente,
				dataEmissao: a.dataEmissao,
				dataFaturamento: a.dataFaturamento,
				quantidadeTotal: a.quantidadeTotal,
				totalSemDescontos: a.totalSemDescontos,
				semitotal: a.semitotal,
				total: a.total,
				transportadora: a.transportadora,
				condicaoDePagamento: a.condicaoDePagamento,
				informacoesAdicionais: a.informacoesAdicionais,
				status: a.status,
				hash: a.hash,
				s: 2,
			});
		}
	});
}
function successVendedores(data) {
	db.vendedores.clear().then(function(){
		for( i = 0; a = data[i]; ++i )
		{
			a = JSON.parse(a);
			db.vendedores.put({
				idx: i,
				id: a.id,
				nome: a.nome,
			});
		}
	});
}


