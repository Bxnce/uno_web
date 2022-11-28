package controllers
import javax.inject._
import play.api.mvc._
import de.htwg.se.uno.Kek
import de.htwg.se.uno.controller.controllerComponent.controllerInterface
import play.api.Logger
import play.api.libs.json.Json

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  val controller: controllerInterface = new Kek().controller_return

  def home(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.home())
  }

  def about(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.about())
  }

  def setup(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.displayGame.prestartState())
  }

  def createGame(name1: String, name2: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)
    Ok(views.html.displayGame.playState(true, controller.return_j))
  }

  def placeCard(ind: Int): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(ind)
    Ok(controller.return_j)
  }

  def retJson(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val json = controller.return_j
    Ok(json)
  }

  def nextPlayer(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.next()
    Ok(controller.return_j)
  }

  def takeCard(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.take()
    Ok(controller.return_j)
  }

  def notFound(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(views.html.notFound())
  }
  
  def badRequest(errorMessage: String): Action[AnyContent] = Action {
    BadRequest(errorMessage + "\n")
  }
}
