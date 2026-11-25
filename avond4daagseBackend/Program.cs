
using Avond4DaagseBackend.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Avond4DaagseBackend.Models;
using Avond4DaagseBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// DATABASE
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// CONTROLLERS EN SWAGGER
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// FRONTEND VERBINDING (ALLEEN LOKAAL)
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5500",
                "http://localhost:5501",
                "http://127.0.0.1:5500",
                "http://127.0.0.1:5501"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// SERVICES
builder.Services.AddScoped<IEvenementService, EvenementService>();
builder.Services.AddScoped<IRouteService, RouteService>();
builder.Services.AddScoped<ISponsorService, SponsorService>();
builder.Services.AddScoped<IInschrijvingService, InschrijvingService>();
builder.Services.AddScoped<ITransactieService, TransactieService>();
builder.Services.AddScoped<IContactvraagService, ContactvraagService>();
builder.Services.AddScoped<IGebruikerService, GebruikerService>();
builder.Services.AddScoped<IRolService, RolService>();
builder.Services.AddScoped<IRechtService, RechtService>();
builder.Services.AddScoped<IDraaiboektaakService, DraaiboektaakService>();
builder.Services.AddScoped<IVrijwilligerService, VrijwilligerService>();
builder.Services.AddScoped<ITaakToewijzingService, TaakToewijzingService>();
builder.Services.AddScoped<IPasswordHasher<Gebruiker>, PasswordHasher<Gebruiker>>();
builder.Services.AddScoped<IDeelnemerService, DeelnemerService>();

// EMAIL SERVICE
builder.Services.AddScoped<EmailService>();

// AUTHENTICATIE MET COOKIES
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode =
                StatusCodes.Status401Unauthorized;

            return Task.CompletedTask;
        };

        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode =
                StatusCodes.Status403Forbidden;

            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// SWAGGER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

// CORS ALLEEN IN DEVELOPMENT
if (app.Environment.IsDevelopment())
{
    app.UseCors("LocalFrontend");
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
