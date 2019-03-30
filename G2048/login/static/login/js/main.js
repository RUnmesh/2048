$("#0").on("click" , rotate);
$("#1").on("click" , rotate);
$("#user").on("blur" , check);
function rotate()
{
    $(".flip").toggleClass("rotate");
}

function check()
{
    username = $("#user").val()
    if (username!='')
    {
        $.ajax({
            url : "/check" , 
            type : "POST" ,
            data : {
                'username' : username
            },
            success: function(data){
                if(data.res == '0')
                {
                    $("#message").removeClass()
                    $("#message").addClass("glyphicon glyphicon-remove")
                    $("#message").css({'color' : 'red'})
                    $('#message').attr('stat' , '0')
                }
                else if (data.res == '1')
                {
                    $("#message").removeClass()
                    $("#message").addClass("glyphicon glyphicon-ok")
                    $("#message").css({'color' : 'green'})
                    $('#message').attr('stat' , '1')
                }
            }
        })
    }
    else
    {
        $("#message").removeClass()
        $('#message').attr('stat' , '0')
    }
}

function validate()
{
    check()
    stat = $('#message').attr('stat')
    if (stat=='0')
    {
        $('#error').html('Username taken or empty. ')
        if($('#pass').val() == "")
            $("#error").append('Password empty.')
        return false;
    }
    else if ($('#pass').val() == "")
    {
        $("#error").append('Password empty.')
        return false;
    }
    return true;
}