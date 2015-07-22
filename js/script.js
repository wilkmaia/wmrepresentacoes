// Criação do Banco de Dados
var db = new Dexie("WMRepresentacoes");
db.version(1).stores({
	clientes: "++id, razaoSocial, cnpj",
	representadas: "++id, razaoSocial, cnpj"
});
db.open();

function showAllLocalStorage() {
	db.clientes.each(function(c){
		console.log("Cliente: " + c.razaoSocial + " - CNPJ: " + c.cnpj );
	});
}

$(document).ready(function(){
	
	$(".cnpj_field").mask("99.999.999/9999-99");
	
	
	$("#_form").submit(function( e ){
		e.preventDefault();
		
		db.clientes.add({
			razaoSocial: $("#_razaoSocial").val(),
			cnpj: $("#_cnpj").val()
		});
		
		$("#_form")[0].reset();
	});
	
	$("#_clear").click(function(){
		$("#_form")[0].reset();
	});
})