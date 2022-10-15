val scalaVersion = "2.13.10"

scalacOptions += "-Ytasty-reader"

lazy val root = (project in file("."))
    .enablePlugins(PlayScala)
    .settings(
        name:= """UNO-Web""",
        libraryDependencies ++= Seq(
            guice,
            "org.scalatestplus.play" %% "scalatestplus-play" % "5.0.0" % Test
        )
    )
